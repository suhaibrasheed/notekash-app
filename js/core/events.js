        const DUMMY_TUTORIAL_ARTICLE = {
            title: "Welcome to Your Second Brain ✨",
            isDummy: true,
            get category() {
                const userCategories = App.settings.get('userCategories') || [];
                const defaultCategory = userCategories.find(c => c.isDefault);
                return defaultCategory ? defaultCategory.name : 'General'; // Fallback just in case.
            },
            get content() {
                const randomQuote = App.util.getRandomMessage(App.util.powerQuotes);
                const randomDevMessage = App.util.getRandomMessage(App.util.wittyDeveloperMessages);
                const styledDivider = `<hr style="border: none; border-top: 2px solid var(--border-color); opacity: 0.5; width: 60%; margin: 2em auto;">`;

                return `
                <!-- Introduction Section -->
                <div class="nk-text-tile color-3" style="margin-top: 1em; margin-bottom: 2em;">
                    <div class="nk-text-tile-content" style="text-align: center; padding: 1rem;">
                        <span class="power-quote-gradient" style="font-size: 1.4em; line-height: 1.4; display: block; margin-bottom: 0.5em;"><b><i>"${randomQuote}"</i></b></span>
                        <p style="margin: 0; font-size: 1.1em; opacity: 0.9;">Welcome to NoteKash! This isn't just a notepad; it's a powerful toolkit for thinking. This interactive note will show you what's possible. Let's begin.</p>
                    </div>
                </div>
                
                ${styledDivider}

                <!-- Section: Never Lose a Fleeting Thought -->
                <div style="margin-top: 3em; margin-bottom: 1.5em;">
                    <h2 style="font-family: var(--article-font-family); font-size: 1.8em; display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5em;">
                        <span style="background: var(--cat-color-2-bg); padding: 0.4rem; border-radius: 12px; display: flex; align-items: center; justify-content: center;">💡</span>
                        Never Lose a Fleeting Thought
                    </h2>
                    <p style="font-size: 1.1em; line-height: 1.8;">Your thoughts aren't flat, so your notes shouldn't be either. ::To Start new note click "+" Icon (top right)_r::. Now use simple shortcuts to bring them to life.</p>
                </div>

                <div class="nk-text-tile color-2" style="margin: 1.5em 0;">
                    <div class="nk-text-tile-content" style="padding: 0.5rem 1rem;">
                        <blockquote style="margin: 0; border-left: 4px solid var(--textile-border-2);">
                            You can type <kbd>&#61;&#61;double equals&#61;&#61;</kbd> for a <span class="highlight-1">quick highlight</span>, and <span class="text-blue"> even apply colored text</span> with <kbd>&#58;&#58;text color &#58;&#58;</kbd>. The most powerful feature? Weave a web of knowledge by creating a <span class="rendered-tag" data-tag="second-brain">[[SuperTag]]</span> when you type <kbd>&#91;&#91;double brackets&#93;&#93;</kbd>. <br/>
                            <i style="font-size: 0.95em; opacity: 0.8; display: block; margin-top: 0.5rem;">Use shortcuts to speed up your workflow e.g (Cmd+1–9) for highlight, find rest in K-Manual.</i>
                        </blockquote>
                    </div>
                </div>

                <ul style="list-style: none; padding-left: 1rem; border-left: 2px solid var(--border-color); margin: 1.5em 0;">
                    <li style="margin-bottom: 0.5em; display: flex; gap: 0.75rem;">
                        <span style="color: var(--primary-color);">✦</span>
                        <span>Start a line with <kbd>*</kbd> then <kbd>space</kbd> for bullet points. You can use '○','⦿','■','‣','✤','◆','◘' as well.</span>
                    </li>
                </ul>

                <!-- Section: Build Lasting Knowledge -->
                <div style="margin-top: 4em; margin-bottom: 1.5em;">
                    <h2 style="font-family: var(--article-font-family); font-size: 1.8em; display: flex; align-items: center; gap: 0.75rem;">
                        <span style="background: var(--cat-color-3-bg); padding: 0.4rem; border-radius: 12px; display: flex; align-items: center; justify-content: center;">🧠</span>
                        Build Lasting Knowledge
                    </h2>
                    <p style="font-size: 1.1em; line-height: 1.8;">Turn passive notes into an active learning system. Use our built-in tools to challenge your memory and solidify knowledge.</p>
                </div>

                <div class="nk-accordion" data-state="open">
                    <div class="nk-accordion-trigger">
                        <span class="nk-accordion-title"><b>How do I practice Active Recall? (Click me)</b></span>
                        <svg class="nk-accordion-chevron" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                    <div class="nk-accordion-content">
                        <p>Use these cards for Q&A (also creates front/back flashcard), or Just type <kbd>&#123;&#123;c1::cloze deletion&#125;&#125;</kbd> to instantly create a {{c1::Cloze Flashcard}} on key terms.</p>
                    </div>
                </div>

                <p style="margin-top: 1.5em;">You can also organize technical notes with clean code blocks.</p>
                <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: var(--border-radius-lg); border: 1px solid var(--border-color); margin: 1em 0;">
                    <pre style="margin: 0; background: transparent; border: none;"><code contenteditable="false" style="border-radius: var(--border-radius); font-family: 'Fira Code', monospace; font-size: 0.95em;">{\n  "idea": "Build a Second Brain",\n  "status": "in_progress",\n  "tags": ["productivity", "learning", "creativity"]\n}</code></pre>
                </div>

                <!-- Section: Create a Learning Engine -->
                <div style="margin-top: 4em; margin-bottom: 1.5em;">
                    <h2 style="font-family: var(--article-font-family); font-size: 1.8em; display: flex; align-items: center; gap: 0.75rem;">
                        <span style="background: var(--cat-color-1-bg); padding: 0.4rem; border-radius: 12px; display: flex; align-items: center; justify-content: center;">⚙️</span>
                        Create a Learning Engine
                    </h2>
                </div>

                <div class="nk-text-tile color-ghost-1" style="margin: 1.5em 0; border: 1px solid var(--primary-color); background: color-mix(in srgb, var(--primary-color) 5%, var(--bg-secondary));">
                    <div class="nk-text-tile-content" contenteditable="false" style="white-space: normal; padding: 1rem;">
                        <p style="margin: 0; line-height: 1.7;">Transform your notes into our powerful, <b>Automated Learning Engine (ALE)</b>. As you write, <i>instantly create flashcards from text using '<kbd>{{c1::cloze}}</kbd>' syntax, from Q&A accordions, or from full MCQ blocks</i>. Our <b> intelligent Spaced Repetition System (SRS) </b>then schedules the perfect time for you to review each card, ensuring you learn efficiently and remember what matters—permanently. <i>Stop just taking notes; start building lasting knowledge.</i></p>
                    </div>
                </div>

                <div class="nk-mcq-block" contenteditable="false">
                    <div class="nk-mcq-question" contenteditable="false">What's the best way to see all of NoteKash's features without leaving the keyboard?</div>
                    <div class="nk-mcq-options">
                        <div class="nk-mcq-option" data-is-correct="false"><div class="nk-mcq-option-text">Memorizing complex shortcuts</div></div>
                        <div class="nk-mcq-option" data-is-correct="true"><div class="nk-mcq-option-text">Pressing the '/' key for the Command Palette</div></div>
                        <div class="nk-mcq-option" data-is-correct="false"><div class="nk-mcq-option-text">Searching through the settings menu</div></div>
                    </div>
                    <div class="nk-mcq-explanation" contenteditable="false"><p><b>Correct!</b> The <b>Command Palette</b> is your superpower in writing. Pressing <b>'/'</b> gives you instant access to insert Tables, Charts, Timelines, Flashcards, MCQs, Lists, Code blocks, Pdfs, Audio, Decktiles and Other Cool Features. You can also Link content, Manage content and even define words on the fly.</p></div>
                </div>

                <!-- Section: See the Big Picture -->
                <div style="margin-top: 4em; margin-bottom: 1.5em;">
                    <h2 style="font-family: var(--article-font-family); font-size: 1.8em; display: flex; align-items: center; gap: 0.75rem;">
                        <span style="background: var(--cat-color-4-bg); padding: 0.4rem; border-radius: 12px; display: flex; align-items: center; justify-content: center;">🗺️</span>
                        See the Big Picture, Instantly
                    </h2>
                    <p style="font-size: 1.1em; line-height: 1.8;">As your Notes Grow, you need to see the Big Picture?. Our <b> Smart & Powerful, Automatic Learning Engine (ALE) </b> works in background to generate MindMaps and create VisualMaps from your Notes. Go to the <b>Visual Map</b> to see how your SuperTags connect—you can even add **Sticky Notes** to your canvas to capture new ideas. Or, view your highlighted snippets in the <b>Mind Map</b>.</p>
                </div>

                <div class="nk-timeline-block" contenteditable="false" style="margin: 2em 0;">
                    <div class="nk-timeline-entry"><div class="nk-timeline-content"><div class="nk-timeline-date">Phase 1</div><div class="nk-timeline-title">Capture Fleeting Ideas</div></div></div>
                    <div class="nk-timeline-entry"><div class="nk-timeline-content"><div class="nk-timeline-date">Phase 2</div><div class="nk-timeline-title">Form Connections & Insights</div></div></div>
                    <div class="nk-timeline-entry"><div class="nk-timeline-content"><div class="nk-timeline-date">Phase 3</div><div class="nk-timeline-title">Achieve Intuitive Clarity</div></div></div>
                </div>

                <div class="chart-container" contenteditable="false" style="background: var(--bg-secondary); padding: 1.5rem; border-radius: var(--border-radius-lg); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);">
                    <canvas data-chart-config='{"type":"bar","data":{"labels":["Clarity","Connections","Recall"],"datasets":[{"data":[20,55,85]}]},"options":{"indexAxis":"x"}}' width="600" height="300" style="max-width: 100%; height: auto;"></canvas>
                </div>

                <!-- Section: The Whiteboard -->
                <div style="margin-top: 4em; margin-bottom: 1.5em;">
                    <h2 style="font-family: var(--article-font-family); font-size: 1.8em; display: flex; align-items: center; gap: 0.75rem;">
                        <span style="background: var(--cat-color-6-bg); padding: 0.4rem; border-radius: 12px; display: flex; align-items: center; justify-content: center;">🎨</span>
                        The Whiteboard
                    </h2>
                    <p style="font-size: 1.1em; line-height: 1.8;">Draw, sketch, annotate images, or create occlusion flashcards directly on a <b>freeform canvas</b>. Access it via the toolbar icon in Read Mode or type <kbd>/whiteboard</kbd> in the Command Palette. Perfect for visual learners and diagramming complex topics.</p>
                </div>

                <div class="nk-textile-deck" contenteditable="false" style="background: color-mix(in srgb, var(--primary-color) 3%, var(--bg-tertiary)); border: 2px dashed var(--primary-color); opacity: 0.9;">
                    <div class="deck-layout-toggle" title="Toggle Layout"><i class="fa-solid fa-table-cells"></i></div>
                    <div class="nk-text-tile color-2" data-color="2"><span class="nk-text-tile-icon">✏️</span><div class="nk-text-tile-content">Freehand Drawing</div></div>
                    <div class="nk-text-tile color-5" data-color="5"><span class="nk-text-tile-icon">🖼️</span><div class="nk-text-tile-content">Annotate Images</div></div>
                    <div class="nk-text-tile color-8" data-color="8"><span class="nk-text-tile-icon">🔲</span><div class="nk-text-tile-content">Flashcard Occlusion</div></div>
                    <div class="nk-text-tile color-3" data-color="3"><span class="nk-text-tile-icon">📝</span><div class="nk-text-tile-content">Mind-Mapping</div></div>
                </div>

                <!-- Section: Reclaim Your Focus & Time -->
                <div style="margin-top: 4em; margin-bottom: 1.5em;">
                    <h2 style="font-family: var(--article-font-family); font-size: 1.8em; display: flex; align-items: center; gap: 0.75rem;">
                        <span style="background: var(--cat-color-8-bg); padding: 0.4rem; border-radius: 12px; display: flex; align-items: center; justify-content: center;">🎯</span>
                        Keep Organized
                    </h2>
                    <p style="font-size: 1.1em; line-height: 1.8;">NoteKash is your focus partner. Enter immersive notes, study flashcards, and use maps to design beautiful notes.</p>
                </div>

                <div class="nk-textile-deck" contenteditable="false">
                    <div class="deck-layout-toggle" title="Toggle Layout"><i class="fa-solid fa-table-cells"></i></div>
                    <div class="nk-text-tile color-1" data-color="1"><span class="nk-text-tile-icon">🎛</span><div class="nk-text-tile-content">Click to Hide</div></div>
                    <div class="nk-text-tile color-5" data-color="5"><span class="nk-text-tile-icon">🎙️</span><div class="nk-text-tile-content">Audio Notes</div></div>
                </div>

                <div class="nk-text-tile color-ghost-1" style="margin: 2em 0; display: flex; max-width: 100%; border: 1px solid var(--warning-color); background: color-mix(in srgb, var(--warning-color) 5%, var(--bg-secondary));">
                    <span class="nk-text-tile-icon" style="font-size: 1.5em; padding: 1rem;">💡</span>
                    <div class="nk-text-tile-content" contenteditable="false" style="white-space: normal; padding: 1rem 1rem 1rem 0;">
                        <b style="color: var(--primary-color);">Pro-Tip:</b> Super Search (<kbd>Ctrl+K</kbd>) is your command center. Use it to instantly <b>Create</b> notes on the fly using Syntax of <i>"note:[category]: Title >> Content"</i>, Create instant tasks using <i>"task:[category]: Task Name #priority" </i>, or Start pomodoro on Tasks or <b>Navigate</b> anywhere with commands like <i>%stats, %quiz, %new etc.</i> to track your learning streaks!
                    </div>
                </div>
                
                <p style="font-size: 1.1em; line-height: 1.8;">You can also Turn your notes into a captivating presentation == with <b>Stage Mode</b> ==g, reveal ideas one by one ==with <b>Cinematic Reveal</b>==c , or set the perfect mood from ==dozens of beautiful <b>Ambiance Themes</b>==. </p>
                <div class="nk-text-tile color-8" style="margin: 1.5em 0; width: fit-content; max-width: 100%;">
                    <div class="nk-text-tile-content" style="padding: 0.5rem 1rem; font-style: italic;">
                        This is just a single note. Imagine the power of these features working in concert across your entire library. Explore the full tutorial to discover even more powerful tools.
                    </div>
                </div>

                ${styledDivider}

                <!-- Section: Unlock Your AI Co-Pilot -->
                <div style="margin-top: 4em; margin-bottom: 1.5em;">
                    <h2 style="font-family: var(--article-font-family); font-size: 1.8em; display: flex; align-items: center; gap: 0.75rem;">
                        <span style="background: var(--cat-color-10-bg); padding: 0.4rem; border-radius: 12px; display: flex; align-items: center; justify-content: center;">✨</span>
                        Unlock Your AI Co-Pilot
                    </h2>
                    <p style="font-size: 1.1em; line-height: 1.8;">NoteKash AI isn't just a AI chatbot; with more than <b> 25+ AI Tools </b>, it's a <b> suite of powerful specialized tools </b> integrated directly into your workflow. Go beyond simple Q&A and let your AI co-pilot actively help you learn, create, think and beautify your notes. To call use "/kashcommands" to get job done faster.</p>
                </div>

                <div class="nk-textile-deck" contenteditable="false" style="border-style: solid; background: transparent;">
                    <div class="deck-layout-toggle" title="Toggle Layout"><i class="fa-solid fa-table-cells"></i></div>
                    <div class="nk-text-tile color-1"><span class="nk-text-tile-icon">❓</span><div class="nk-text-tile-content"><b>KashAsk</b></div></div>
                    <div class="nk-text-tile color-2"><span class="nk-text-tile-icon">🪄</span><div class="nk-text-tile-content"><b>KashCurate</b></div></div>
                    <div class="nk-text-tile color-8"><span class="nk-text-tile-icon">📜</span><div class="nk-text-tile-content"><b>KashSummary</b></div></div>
                    <div class="nk-text-tile color-3"><span class="nk-text-tile-icon">📇</span><div class="nk-text-tile-content"><b>KashFlash</b></div></div>
                    <div class="nk-text-tile color-7"><span class="nk-text-tile-icon">🔑</span><div class="nk-text-tile-content"><b>KashKeywords</b></div></div>
                    <div class="nk-text-tile color-6"><span class="nk-text-tile-icon">💡</span><div class="nk-text-tile-content"><b>KashExplain</b></div></div>
                    <div class="nk-text-tile color-4"><span class="nk-text-tile-icon">🧠</span><div class="nk-text-tile-content"><b>KashMnemonic</b></div></div>
                    <div class="nk-text-tile color-5"><span class="nk-text-tile-icon">✏️</span><div class="nk-text-tile-content"><b>KashScript</b></div></div>
                    <div class="nk-text-tile color-9"><span class="nk-text-tile-icon">🖍</span><div class="nk-text-tile-content"><b>KashHighlight</b></div></div>
                    <div class="nk-text-tile color-3"><span class="nk-text-tile-icon">📍</span><div class="nk-text-tile-content"><b>KashTags</b></div></div>
                </div>

                <div class="nk-text-tile color-ghost-1" style="margin: 2em 0; display: flex; max-width: 100%; border: 1px dotted var(--primary-color);">
                    <span class="nk-text-tile-icon" style="font-size: 1.5em; padding: 1rem;">🚀</span>
                    <div class="nk-text-tile-content" contenteditable="false" style="white-space: normal; padding: 1rem 1rem 1rem 0;">
                        <b>Pro-Tip:</b> Apart from using "/kashask" in in command palette of Write mode, You can also use "kashask:" command on Global search.
                    </div>
                </div>

                <p style="text-align: center; font-size: 1.3em; line-height: 1.5; margin: 2em 0;"><span class="power-quote-gradient"><b><i>Stop just writing notes. Start building knowledge with an AI partner that understands your learning.</i></b></span></p>
                
                ${styledDivider}

                <!-- Section: The NoteKash Difference -->
                <div style="margin-top: 4em; margin-bottom: 2em;">
                    <h2 style="font-family: var(--article-font-family); font-size: 1.8em; display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1em;">
                        <span style="background: var(--cat-color-0-bg); padding: 0.4rem; border-radius: 12px; display: flex; align-items: center; justify-content: center;">💎</span>
                        The NoteKash Difference
                    </h2>
                    <p style="font-size: 1.1em; line-height: 1.8;">Built for thinkers, learners, and creators who value speed, ownership, and a beautifully integrated workflow. This app is truely powerful that can replace your many apps for "Todo", "Pomodoro", "Mindmapping", "Flashcards", "Visualmapping" with power of Note Taking.</p>
                </div>

                <div id="article-content" style="margin: 2em 0; overflow-x: auto;">
                    <table style="width: 100%; border-collapse: separate; border-spacing: 0; border-radius: var(--border-radius-lg); overflow: hidden; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);">
                        <thead>
                            <tr style="background-color: var(--bg-tertiary);">
                                <th style="padding: 16px; text-align: left; font-size: 1.1em; border-bottom: 2px solid var(--border-color);">Feature</th>
                                <th style="padding: 16px; text-align: center; font-size: 1.1em; background-color: color-mix(in srgb, var(--danger-color) 8%, var(--bg-tertiary)); border-bottom: 2px solid var(--border-color);">Most Note Apps</th>
                                <th style="padding: 16px; text-align: center; font-size: 1.1em; background-color: color-mix(in srgb, var(--success-color) 8%, var(--bg-tertiary)); border-bottom: 2px solid var(--border-color); color: var(--primary-color);">NoteKash</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-top: 1px solid var(--border-color);">
                                <td style="padding: 14px 16px; font-weight: 500;">Data Ownership</td>
                                <td style="padding: 14px 16px; text-align: center; opacity: 0.8;">☁️ Cloud-Only</td>
                                <td style="padding: 14px 16px; text-align: center; font-weight: 600; color: var(--primary-color);">📂 User Owned</td>
                            </tr>
                            <tr style="background-color: color-mix(in srgb, var(--border-color) 5%, transparent);">
                                <td style="padding: 14px 16px; font-weight: 500;">Pricing Model</td>
                                <td style="padding: 14px 16px; text-align: center;"><span class="nk-stat-badge" style="background: var(--bg-secondary); color: var(--text-secondary);">💳 Costly Monthly Subscriptions</span></td>
                                <td style="padding: 14px 16px; text-align: center;"><span class="nk-stat-badge" style="background: var(--bg-secondary); border-color: var(--primary-color); color: var(--primary-color); font-weight: 600;">💵 Lowest Price with One Time Cost</span></td>
                            </tr>
                            <tr>
                                <td style="padding: 14px 16px; font-weight: 500;">Offline Access</td>
                                <td style="padding: 14px 16px; text-align: center; color: var(--danger-color);">🔴 Limited / None</td>
                                <td style="padding: 14px 16px; text-align: center; color: var(--success-color); font-weight: 600;">🟢 Full Functionality</td>
                            </tr>
                            <tr style="background-color: color-mix(in srgb, var(--border-color) 5%, transparent);">
                                <td style="padding: 14px 16px; font-weight: 500;">Integrated Learning</td>
                                <td style="padding: 14px 16px; text-align: center; color: var(--danger-color);">🔴 Separate Apps Needed</td>
                                <td style="padding: 14px 16px; text-align: center; color: var(--success-color); font-weight: 600;">🟢 Built-in SRS Flashcards</td>
                            </tr>
                            <tr>
                                <td style="padding: 14px 16px; font-weight: 500;">Visual Thinking</td>
                                <td style="padding: 14px 16px; text-align: center; color: var(--danger-color);">🔴 Basic Linking</td>
                                <td style="padding: 14px 16px; text-align: center; color: var(--success-color); font-weight: 600;">🟢 Mind & Visual Maps</td>
                            </tr>
                            <tr style="background-color: color-mix(in srgb, var(--border-color) 5%, transparent);">
                                <td style="padding: 14px 16px; font-weight: 500;">Focus Tools</td>
                                <td style="padding: 14px 16px; text-align: center; color: var(--danger-color);">🔴 Minimal</td>
                                <td style="padding: 14px 16px; text-align: center; color: var(--success-color); font-weight: 600;">🟢 Pomodoro, Zen Mode, Todo</td>
                            </tr>
                            <tr>
                                <td style="padding: 14px 16px; font-weight: 500;">Note AI</td>
                                <td style="padding: 14px 16px; text-align: center; color: var(--danger-color);">🔴 Limited & Costly</td>
                                <td style="padding: 14px 16px; text-align: center; color: var(--success-color); font-weight: 600;">🟢 Unlimited & Powerful</td>
                            </tr>
                            <tr style="background-color: color-mix(in srgb, var(--border-color) 5%, transparent);">
                                <td style="padding: 14px 16px; font-weight: 500;">Speed & Performance</td>
                                <td style="padding: 14px 16px; text-align: center;">🐌 Can be slow</td>
                                <td style="padding: 14px 16px; text-align: center; font-weight: 600; color: var(--primary-color);">⚡️ Blazing Fast</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <p style="text-align: center; font-size: 1.3em; line-height: 1.5; margin-top: 3em; margin-bottom: 2em;"><span class="power-quote-gradient"><b><i>${randomDevMessage}</i></b></span></p>
                `;
            }
        };

export const events = {

                transitionToLibrary(loadFunction) {
                    const welcomeView = document.getElementById('welcome-view');
                    if (welcomeView && welcomeView.classList.contains('active')) {
                        welcomeView.classList.add('fading-out');
                        setTimeout(() => {
                            loadFunction();
                        }, 350);
                    } else {
                        loadFunction();
                    }
                },

                useBrowserStorage() {
                    this.transitionToLibrary(async () => {
                        // Clear all previous state
                        await App.settings.set('lastStorageMode', 'browser');
                        App.state.isInitialLoadComplete = false;
                        App.state.isHydrated = false;
                        App.state.articles = [];

                        App.state.storageMode = 'browser';
                        App.state.directoryHandle = null;
                        await App.indexedDB.setHandle('directory', null);

                        await App.settings.load();

                        App.ui.applyTheme(App.settings.get('theme'));
                        await App.loadInitialData();
                        App.router.navigateTo('library');
                    });
                },


                handlePopState(event) {
                    if (event.state) {
                        App.router.navigateTo(event.state.viewId, event.state.data, true);
                    }
                },
                changeLibraryTitle(event) {
                    let newTitle = event.target.value.trim();
                    if (!newTitle) {
                        newTitle = 'My Library'; // Fallback to default if empty
                    }
                    App.settings.set('libraryTitle', newTitle);

                    // Live update the title if the library view is active
                    const libraryTitleEl = document.querySelector('#library-view .library-title');
                    if (libraryTitleEl) {
                        libraryTitleEl.textContent = newTitle;
                    }
                },
                changeLibrarySort(event) {
                    App.settings.set('librarySortBy', event.target.value);
                    App.ui.filterAndRenderArticles();
                },

                cycleReaderTheme(goBack = false) {
                    const themes = App.events.presentation.themes;
                    const currentIndex = themes.indexOf(App.state.activeReaderTheme);
                    const nextIndex = goBack
                        ? (currentIndex - 1 + themes.length) % themes.length
                        : (currentIndex + 1) % themes.length;
                    const newTheme = themes[nextIndex];

                    App.state.activeReaderTheme = newTheme;
                    App.settings.set('readerTheme', newTheme); // Remember the choice
                    App.ui.applyReaderTheme();

                    const themeName = newTheme.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    App.ui.showToast(`${themeName} Theme`, { type: 'info', duration: 1500 });
                },
                resetReaderTheme() {
                    App.state.activeReaderTheme = 'default';
                    App.settings.set('readerTheme', 'default');
                    App.ui.applyReaderTheme();
                    App.ui.showToast('Theme reset to default', { type: 'success', duration: 2000 });
                },


                handleGlobalClickInterceptor(event) {
                    // --- COLLAPSIBLE HEADINGS INTERACTION ---
                    const collapsibleHeading = event.target.closest('.collapsible-heading');
                    const collapsibleIcon = event.target.closest('[data-collapsible-icon]');

                    if (collapsibleHeading && collapsibleHeading.closest('#article-content, #read-view')) {
                        // Determine if we should toggle
                        let shouldToggle = false;

                        if (collapsibleIcon) {
                            // Always toggle if clicking the icon directly
                            shouldToggle = true;
                        } else if (App.state.currentMode === 'read') {
                            // In read mode, toggle when clicking anywhere on the heading
                            shouldToggle = true;
                        } else if (App.state.currentMode === 'write') {
                            // In write mode, only toggle if clicking the left gutter area (before the text)
                            const rect = collapsibleHeading.getBoundingClientRect();
                            const iconElement = collapsibleHeading.querySelector('[data-collapsible-icon]');
                            if (iconElement) {
                                const iconRect = iconElement.getBoundingClientRect();
                                // If click is within or to the left of the icon
                                if (event.clientX <= iconRect.right + 5) {
                                    shouldToggle = true;
                                }
                            }
                        }

                        if (!shouldToggle) return;

                        const heading = collapsibleHeading;
                        const level = parseInt(heading.tagName.substring(1));
                        const isCollapsed = heading.getAttribute('data-collapsed') === 'true';

                        const newState = !isCollapsed;
                        heading.setAttribute('data-collapsed', newState);

                        let next = heading.nextElementSibling;
                        while (next) {
                            // Stop if we hit a heading of same or higher importance
                            if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(next.tagName)) {
                                const nextLevel = parseInt(next.tagName.substring(1));
                                if (nextLevel <= level) break;
                            }

                            if (newState) {
                                next.classList.add('collapsible-hidden');
                            } else {
                                next.classList.remove('collapsible-hidden');
                            }
                            next = next.nextElementSibling;
                        }

                        event.preventDefault();
                        event.stopPropagation();
                        return;
                    }

                    const lockedElement = event.target.closest('.premium-feature-locked');

                    if (lockedElement && event.target.closest('.stage-mode-controls')) return;
                    if (lockedElement && !App.license.isPremium()) {
                        event.preventDefault();
                        event.stopPropagation();
                        const fk = lockedElement.dataset.featureKey || null;
                        App.ui.showAscensionModal(fk);
                    }
                },

                generateLicenseRequestEmail() {
                    const name = document.getElementById('license-name-input')?.value || '[Name not provided]';
                    const status = document.getElementById('license-status-input')?.value || '[Status not provided]';
                    const tierSelect = document.getElementById('license-tier-select');
                    const tier = tierSelect.options[tierSelect.selectedIndex].text;

                    const subject = `NoteKash License Key Request - ${tier}`;
                    const body = `Hi there,\n\nMyself, ${name} am applying for a license key.\n\nStatus/Bio: ${status}\n\nKindly provide me with a License Key for the ${tier}.\n\nThank you!`;

                    const mailtoLink = `mailto:learningmarvel@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

                    window.location.href = mailtoLink;
                },

                // New function to handle the command palette button click
                openCommandPaletteFromButton() {
                    const contentDiv = document.getElementById('article-content');
                    if (!contentDiv) return;

                    // Re-focus the editor to ensure we have an active cursor position.
                    contentDiv.focus();

                    // Use a tiny delay to allow the browser to process the focus event.
                    setTimeout(() => {
                        const selection = window.getSelection();
                        const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
                        App.commandPalette.open(range);
                    }, 10);
                },

                handleSyncToggle() {
                    if (!App.license.isPremium()) {
                        App.ui.showAscensionModal();
                        return;
                    }
                    const syncEnabled = App.settings.get('enableDropboxSync');
                    App.settings.set('enableDropboxSync', !syncEnabled);
                    App.ui.showStorageModal();
                    if (!syncEnabled && App.dropbox.isReady()) {
                        App.dropbox.syncChanges(true);
                    }
                },


                setupGlobalListeners() {
                    document.body.addEventListener('click', this.handleGlobalClickInterceptor, true);
                    document.getElementById('profile-badge')?.addEventListener('click', (event) => {
                        event.stopPropagation(); // Prevent immediate closing by closeProfileNotificationOutside
                        App.ui.toggleProfileNotification();
                    });
                    // Listen for the browser's back/forward button events.
                    window.addEventListener('popstate', this.handlePopState);

                    document.addEventListener('mousedown', (e) => {
                        if (!e.target.closest('#selection-toolbar')) App.ui.hideSelectionToolbar();
                        if (!e.target.closest('#image-toolbar')) App.ui.hideImageToolbar();
                        if (!e.target.closest('.context-menu')) App.ui.hideContextMenu();
                    });

                    document.addEventListener('click', (e) => {
                        // Specifically check for backlink clicks within the article content in read mode
                        const link = e.target.closest('#article-content a[data-link-type]');
                        if (link && App.state.currentMode === 'read') {
                            e.preventDefault();
                            e.stopPropagation(); // Stop other click events
                            const { linkType, linkId, articleId } = link.dataset;
                            if (linkType === 'article') {
                                App.router.navigateTo('article', { id: linkId, mode: 'read' });
                            } else if (linkType === 'snippet' || linkType === 'mindmap_snippet') {
                                App.router.navigateTo('article', { id: articleId, mode: 'read', scrollToSnippetId: linkId });
                            }
                        }
                    });

                    // --- Table of Contents (TOC) Click Handler ───
                    document.addEventListener('click', (e) => {
                        const link = e.target.closest('.nk-toc-item');
                        if (link) {
                            e.preventDefault();
                            e.stopPropagation();
                            const targetId = link.getAttribute('href').substring(1);
                            const targetEl = document.getElementById(targetId);
                            if (targetEl) {
                                targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                
                                // Highlight the heading temporarily
                                const origBg = targetEl.style.backgroundColor;
                                const origTransition = targetEl.style.transition;
                                
                                targetEl.style.transition = 'background-color 0.3s ease';
                                targetEl.style.backgroundColor = 'rgba(251, 211, 141, 0.35)';
                                
                                setTimeout(() => {
                                    targetEl.style.backgroundColor = origBg;
                                    setTimeout(() => {
                                        targetEl.style.transition = origTransition;
                                    }, 300);
                                }, 1200);
                            }
                        }
                        
                        // Handle TOC Refresh button click
                        const refreshBtn = e.target.closest('.nk-toc-refresh-btn');
                        if (refreshBtn) {
                            e.preventDefault();
                            e.stopPropagation();
                            App.commandPalette.insertTableOfContents({ refreshOnly: true });
                        }
                    });

                    // --- GLOBAL MAP CONTROL LISTENER (Fix for Read Mode Fullscreen) ---
                    document.addEventListener('click', (e) => {
                        const mapBtn = e.target.closest('.nk-map-btn');
                        if (mapBtn && (document.body.classList.contains('read-mode') || document.body.contains(mapBtn))) {
                            let action = mapBtn.dataset.action;
                            if (!action) {
                                const title = mapBtn.getAttribute('title') || '';
                                if (title.includes('Fullscreen') || title.includes('Exit Fullscreen')) action = 'fullscreen';
                                else if (title.includes('Edit')) action = 'edit';
                                else if (title.includes('Remove')) action = 'delete';
                                else if (mapBtn.classList.contains('is-delete')) action = 'delete';
                            }

                            if (action && typeof App.handleMapAction === 'function') {
                                // Mock event to satisfy handleMapAction's dependence on currentTarget
                                const mockEvent = {
                                    preventDefault: () => { e.preventDefault(); },
                                    stopPropagation: () => { e.stopPropagation(); },
                                    currentTarget: mapBtn,
                                    target: e.target
                                };
                                App.handleMapAction(mockEvent, action);
                            }
                        }
                    });

                    document.addEventListener('keydown', this.handleGlobalKeyDown);

                    document.addEventListener('copy', (e) => {
                        const isArticleActive = document.getElementById('article-view')?.classList.contains('active');
                        if (isArticleActive) {
                            const article = App.storage.getArticle(App.state.activeArticleId);
                            if (article && (article.isReadOnly || article.preventReExport)) {
                                e.preventDefault();
                                if (e.clipboardData) e.clipboardData.setData('text/plain', ''); // Overwrite clipboard just in case
                                App.ui.showToast('Creator has disabled copying from this note', { type: 'warning' });
                            }
                        }
                    });
                    const flushUnsavedOnExit = () => {
                        if (App.state.isArticleDirty && App.state.currentMode === 'write') {
                            App.events.saveArticle({ force: true, isAutosave: true });
                        }
                    };
                    window.addEventListener('pagehide', () => {
                        flushUnsavedOnExit();
                        App.quiz.saveStats();
                        App.settings.save();
                    });
                    window.addEventListener('beforeunload', flushUnsavedOnExit);
                    window.addEventListener('beforeinstallprompt', App.pwa.handleInstallPrompt);
                    document.getElementById('install-pwa-btn')?.addEventListener('click', this.installPwa);

                    // Cross-window / Split-screen frame synchronization
                    if (typeof BroadcastChannel !== 'undefined') {
                        try {
                            const syncChannel = new BroadcastChannel('notekash_state_sync');
                            const refreshActiveView = () => {
                                const activeView = App.router.getActiveView();
                                if (activeView === 'library') {
                                    App.ui.filterAndRenderArticles();
                                } else if (activeView === 'category') {
                                    const catViewEl = document.getElementById('category-view');
                                    if (catViewEl && App.ui.renderCategoryView) App.ui.renderCategoryView(catViewEl, App.router.getActiveViewData());
                                } else if (activeView === 'flashcard') {
                                    const fcViewEl = document.getElementById('flashcard-view');
                                    if (fcViewEl && App.ui.renderFlashcardView) App.ui.renderFlashcardView(fcViewEl);
                                } else if (activeView === 'tags') {
                                    const tagsViewEl = document.getElementById('tags-view');
                                    if (tagsViewEl && App.ui.renderTagsView) App.ui.renderTagsView(tagsViewEl);
                                }
                            };

                            syncChannel.onmessage = (event) => {
                                const { type, id, article } = event.data || {};
                                if (type === 'ARTICLE_CREATED' && article) {
                                    if (!App.state.articles.some(a => a.id === article.id)) {
                                        App.state.articles.unshift(article);
                                        App.state.articles.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                                        refreshActiveView();
                                    }
                                } else if (type === 'ARTICLE_UPDATED' && article) {
                                    const idx = App.state.articles.findIndex(a => a.id === id);
                                    if (idx > -1) {
                                        App.state.articles[idx] = article;
                                    } else {
                                        App.state.articles.unshift(article);
                                    }
                                    App.state.articles.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

                                    if (App.state.activeArticleId === id && App.state.currentMode === 'read' && App.router.getActiveView() === 'article') {
                                        App.ui.renderArticleControls(article);
                                        App.ui.updateArticleMetadata(article.content, article.createdAt);
                                    } else {
                                        refreshActiveView();
                                    }
                                } else if (type === 'ARTICLE_DELETED' && id) {
                                    App.state.articles = App.state.articles.filter(a => a.id !== id);
                                    if (App.state.activeArticleId === id) {
                                        App.router.navigateTo('library');
                                    } else {
                                        refreshActiveView();
                                    }
                                }
                            };
                        } catch (e) {
                            console.warn("BroadcastChannel sync listener could not be started:", e);
                        }
                    }
                },

                // Located in App.events
                mountViewListeners(viewId) {
                    const setupDebouncedSearch = (inputId, filterFunction) => {
                        const input = document.getElementById(inputId);
                        if (input) {
                            // Use the new generic debounce, ensuring 'this' context if needed (though App.ui methods are bound usually)
                            const debouncedHandler = App.util.debounce(() => {
                                filterFunction.call(App.ui);
                                const toast = document.getElementById('search-feedback-toast');
                                if (toast) App.ui.hideToast(toast);
                            }, 300);

                            input.addEventListener('input', (e) => {
                                // --- VISUAL FEEDBACK: Show Indexing Toast ---
                                const existingToast = document.getElementById('search-feedback-toast');
                                if (!existingToast) {
                                    App.ui.showToast('Searching...', { type: 'searching-process', duration: 0, id: 'search-feedback-toast' });
                                }
                                debouncedHandler(e);
                            });
                        }
                    };

                    switch (viewId) {
                        case 'library':
                            const grid = document.getElementById('article-grid');
                            const gridContainer = document.getElementById('article-grid-container'); // Just in case we need container-level events

                            // Initialize with empty state or wait for filterAndRender
                            if (grid) grid.innerHTML = '';

                            // --- Event Delegation ---
                            if (grid) {
                                grid.addEventListener('click', (e) => {
                                    // Handle Premium Card
                                    const premiumCard = e.target.closest('.library-premium-card');
                                    if (premiumCard) {
                                        App.router.navigateTo('article', { articleObject: DUMMY_TUTORIAL_ARTICLE, mode: 'read' });
                                        return;
                                    }

                                    // Handle Regular Cards
                                    const card = e.target.closest('.article-card');
                                    if (card) {
                                        const articleId = card.dataset.id;
                                        if (articleId) {
                                            App.router.navigateTo('article', { id: articleId, mode: 'read' });
                                        }
                                    }
                                });

                                // Accessibility for Delegation
                                grid.addEventListener('keydown', (e) => {
                                    if (e.key === 'Enter') {
                                        const card = e.target.closest('.article-card');
                                        if (card) {
                                            // Trigger click logic
                                            if (card.classList.contains('library-premium-card')) {
                                                App.router.navigateTo('article', { articleObject: DUMMY_TUTORIAL_ARTICLE, mode: 'read' });
                                            } else if (card.dataset.id) {
                                                App.router.navigateTo('article', { id: card.dataset.id, mode: 'read' });
                                            }
                                        }
                                    }
                                });
                            }

                            setupDebouncedSearch('search-input', App.ui.filterAndRenderArticles);
                            document.getElementById('sort-filter')?.addEventListener('change', (e) => App.events.changeLibrarySort(e));

                            document.getElementById('search-input')?.addEventListener('keydown', (e) => {
                                const { searchResults, selectedIndex } = App.state.libraryRender;
                                if (!searchResults || searchResults.length === 0) return;
                                let newIndex = selectedIndex;
                                let handled = false;
                                if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { newIndex = (selectedIndex + 1) % searchResults.length; handled = true; }
                                else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { newIndex = (selectedIndex - 1 + searchResults.length) % searchResults.length; handled = true; }
                                else if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const selectedCard = searchResults[selectedIndex];
                                    // With delegation, we can't just .click() because the listener is on the grid?
                                    // Actually .click() propagates up, so the grid listener WILL catch it!
                                    if (selectedCard) selectedCard.click();
                                    return;
                                }
                                if (handled) { e.preventDefault(); if (selectedIndex > -1) searchResults[selectedIndex].classList.remove('search-selected-card'); searchResults[newIndex].classList.add('search-selected-card'); searchResults[newIndex].scrollIntoView({ behavior: 'smooth', block: 'center' }); App.state.libraryRender.selectedIndex = newIndex; }
                            });
                            break;
                        case 'article':
                            const articleControls = document.getElementById('article-controls');
                            if (articleControls) articleControls.addEventListener('mousedown', this.handleArticleControlsClick);
                            const mainEl = document.querySelector('main');
                            if (mainEl) mainEl.addEventListener('scroll', App.events.updateReadingProgress, { passive: true });
                            const contentDiv = document.getElementById('article-content');
                            if (contentDiv) contentDiv.addEventListener('click', this.handleContentClick);
                            const exportBtn = document.getElementById('export-popover-btn');
                            if (exportBtn) {
                                const popoverGroup = exportBtn.parentElement;

                                const closePopover = (e) => {
                                    if (!popoverGroup.contains(e.target)) {
                                        popoverGroup.classList.remove('popover-active');
                                        document.removeEventListener('click', closePopover);
                                    }
                                };

                                exportBtn.addEventListener('click', (e) => {
                                    e.stopPropagation();
                                    const isActive = popoverGroup.classList.toggle('popover-active');
                                    if (isActive) {
                                        document.addEventListener('click', closePopover);
                                    }
                                });
                            }

                            if (App.state.currentMode === 'write') {
                                const titleInput = document.getElementById('article-title');
                                const setDirty = () => { App.state.isArticleDirty = true; };
                                let audioInitTimeout;

                                titleInput.addEventListener('input', setDirty);

                                // Debounced Autosave — fires 5s after last input.
                                const debouncedAutosave = App.util.debounce(() => {
                                    if (!App.state.isArticleDirty) return;
                                    const performSave = () => App.events.saveArticle({ isAutosave: true });
                                    if (window.requestIdleCallback) {
                                        // timeout=16000: only force-run if browser has been busy for 16s
                                        requestIdleCallback(performSave, { timeout: 16000 });
                                    } else {
                                        setTimeout(performSave, 100);
                                    }
                                }, 5000);

                                contentDiv.addEventListener('input', (e) => {
                                    setDirty();
                                    contentDiv.classList.remove('is-empty');
                                    
                                    // Parse MCQ metadata if user edits the explanation
                                    if (e.target) {
                                        const expEl = e.target.closest('.nk-mcq-explanation');
                                        if (expEl) {
                                            App.util.parseMcqExplanationMeta(expEl);
                                        }
                                    }
                                    
                                    debouncedAutosave();
                                    requestAnimationFrame(() => App.util.ensureCaretVisible());
                                    clearTimeout(audioInitTimeout);
                                    audioInitTimeout = setTimeout(() => {
                                        App.audio.initializePlayersIn(contentDiv);
                                    }, 500); // 500ms delay after last input
                                });
                                // Interval autosave removed in favor of debounced autosave
                                const guardianCallback = () => { if (contentDiv.childElementCount === 0 || (contentDiv.childElementCount === 1 && contentDiv.firstElementChild.tagName === 'BR')) { contentDiv.innerHTML = '<p><br></p>'; } };
                                App.state.guardianObserver = new MutationObserver(guardianCallback);
                                App.state.guardianObserver.observe(contentDiv, { childList: true });
                                guardianCallback();

                                contentDiv.addEventListener('focusin', (e) => {
                                    if (document.body.classList.contains('mobile-view') && App.util.isMobile()) {
                                        setTimeout(() => {
                                            e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        }, 300); // A small delay allows the keyboard to animate in
                                    }
                                });
                                contentDiv.addEventListener('paste', App.events.handlePaste);
                                contentDiv.addEventListener('keydown', (e) => {
                                    const trigger = document.activeElement.closest('.nk-accordion-trigger');
                                    if ((e.key === 'Enter' || e.key === ' ') && trigger && !document.activeElement.isContentEditable) {
                                        e.preventDefault();
                                        trigger.click();
                                        return;
                                    }
                                    App.events.handleWriterShortcuts(e);
                                });
                                contentDiv.addEventListener('focusin', App.events.handleFocusIn);
                                contentDiv.addEventListener('dragover', App.events.handleDragOver);
                                contentDiv.addEventListener('dragleave', App.events.handleDragLeave);
                                contentDiv.addEventListener('drop', App.events.handleImageDrop);
                            }

                            // Register in BOTH read & write mode so the word-count toast works
                            contentDiv.addEventListener('mouseup', App.events.handleSelection);
                            break;
                        case 'tags':
                            setupDebouncedSearch('tag-search-input', App.events.filterAndRenderTags);
                            document.getElementById('tag-sort-filter')?.addEventListener('change', App.events.changeTagSort);
                            break;
                        case 'flashcard':
                            document.getElementById('flashcard-sort')?.addEventListener('change', App.events.changeFlashcardSort);
                            setupDebouncedSearch('flashcard-search-input', App.ui.filterAndRenderFlashcards);
                            document.getElementById('flashcard-search-input')?.addEventListener('keydown', (e) => {
                                const { searchResults, selectedIndex } = App.state.flashcardRender;
                                if (!searchResults || searchResults.length === 0) return;
                                let newIndex = selectedIndex;
                                let handled = false;
                                if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { newIndex = (selectedIndex + 1) % searchResults.length; handled = true; }
                                else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { newIndex = (selectedIndex - 1 + searchResults.length) % searchResults.length; handled = true; }
                                else if (e.key === 'Enter') { e.preventDefault(); const selectedCard = searchResults[selectedIndex]; if (selectedCard) selectedCard.click(); return; }
                                if (handled) { e.preventDefault(); if (selectedIndex > -1) searchResults[selectedIndex].classList.remove('search-selected-card'); searchResults[newIndex].classList.add('search-selected-card'); searchResults[newIndex].scrollIntoView({ behavior: 'smooth', block: 'center' }); App.state.flashcardRender.selectedIndex = newIndex; }
                            });
                            break;
                    }
                },


                typewriter: {
                    intervalId: null,

                    start(element) {
                        this.reset(); // Stop any previous typewriter effect
                        if (!element) return;

                        const words = element.querySelectorAll('.reveal-word');
                        if (words.length === 0) return; // Nothing to type

                        let wordIndex = 0;
                        this.intervalId = setInterval(() => {
                            if (wordIndex < words.length) {
                                words[wordIndex].classList.add('visible');
                                wordIndex++;
                            } else {
                                this.reset(); // Effect finished, clear the timer
                            }
                        }, 50); // Adjust typing speed here (milliseconds)
                    },

                    // This function clears any active typewriter timer
                    reset() {
                        if (this.intervalId) {
                            clearInterval(this.intervalId);
                            this.intervalId = null;
                        }
                    }
                },

                // --- Stage Timer Feature (Enhanced & Premium) ---
                stageTimer: {
                    state: {
                        duration: 5,
                        timeLeft: 5,
                        interval: null,
                        isRunning: false,
                        dragData: { isDragging: false, startX: 0, startY: 0, offsetX: 0, offsetY: 0 }
                    },

                    toggle() {
                        const overlay = document.getElementById('focus-mode-overlay');
                        if (!overlay) return;

                        let widget = document.getElementById('stage-timer-widget');
                        if (!widget) {
                            this.render(overlay);
                            widget = document.getElementById('stage-timer-widget');
                            void widget.offsetWidth; // Force Reflow
                            requestAnimationFrame(() => {
                                widget.classList.remove('hidden');
                                widget.style.display = 'flex';
                                widget.style.opacity = '1';
                                widget.style.transform = 'scale(1)';
                            });
                        } else {
                            if (widget.classList.contains('hidden') || widget.style.display === 'none') {
                                widget.classList.remove('hidden');
                                widget.style.display = 'flex';
                                requestAnimationFrame(() => {
                                    widget.style.opacity = '1';
                                    widget.style.transform = 'scale(1)';
                                });
                            } else {
                                widget.style.opacity = '0';
                                widget.style.transform = 'scale(0.8)';
                                setTimeout(() => {
                                    widget.classList.add('hidden');
                                    widget.style.display = 'none';
                                    this.stop(); // Stop if hidden
                                }, 300);
                            }
                        }
                    },

                    render(overlay) {
                        const div = document.createElement('div');
                        div.id = 'stage-timer-widget';
                        div.className = 'stage-timer-widget hidden';
                        div.style.display = 'none'; // Start hidden

                        // Load saved duration from localStorage
                        const savedDuration = localStorage.getItem('nk-stage-timer-duration');
                        if (savedDuration) {
                            const duration = parseInt(savedDuration);
                            if (!isNaN(duration) && duration > 0) {
                                this.state.duration = duration;
                                this.state.timeLeft = duration;
                            }
                        }

                        // Load saved position from localStorage
                        const savedPos = localStorage.getItem('nk-stage-timer-position');
                        if (savedPos) {
                            try {
                                const pos = JSON.parse(savedPos);
                                div.style.top = pos.top;
                                div.style.right = pos.right;
                            } catch (e) { }
                        }

                        div.innerHTML = `
                            <svg class="stage-timer-progress-svg" viewBox="0 0 100 100">
                                <circle class="stage-timer-progress-bg" cx="50" cy="50" r="45"></circle>
                                <circle class="stage-timer-progress-fg" cx="50" cy="50" r="45" transform="rotate(-90 50 50)"></circle>
                            </svg>
                            <span class="stage-timer-label" style="z-index: 1;">TIMER</span>
                            <div id="stage-timer-display-visual" class="stage-timer-display-visual" style="z-index: 1;"></div>
                            <input type="number" id="stage-timer-input" class="stage-timer-input" value="${this.state.duration}" min="1" max="999" style="z-index: 1;" />
                            <div class="stage-timer-status" id="stage-timer-status" style="z-index: 1;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z"/></svg> 
                                <span>Click to Start</span>
                            </div>
                        `;
                        overlay.appendChild(div);

                        const input = document.getElementById('stage-timer-input');

                        // Setup drag functionality
                        this.setupDrag(div);

                        // Single click to toggle (only on widget, not input)
                        let clickTimeout = null;
                        div.addEventListener('click', (e) => {
                            if (e.target.tagName === 'INPUT' || this.state.dragData.isDragging) return;

                            if (clickTimeout) {
                                clearTimeout(clickTimeout);
                                clickTimeout = null;
                                return; // This is part of a double-click
                            }

                            clickTimeout = setTimeout(() => {
                                this.toggleRun();
                                clickTimeout = null;
                            }, 250);
                        });

                        // Double click to reset
                        div.addEventListener('dblclick', (e) => {
                            if (e.target.tagName === 'INPUT') return;
                            if (clickTimeout) {
                                clearTimeout(clickTimeout);
                                clickTimeout = null;
                            }
                            this.reset();
                            App.ui.showToast('Timer reset', { type: 'info' });
                        });

                        input.onfocus = () => {
                            this.stop(); // Stop timer when editing
                            div.classList.add('editing');
                        };

                        input.onblur = () => {
                            div.classList.remove('editing');
                            let val = parseInt(input.value);
                            if (isNaN(val) || val < 1) val = this.state.duration;
                            if (val > 999) val = 999;
                            input.value = val;

                            // Save the new duration persistently
                            this.state.duration = val;
                            this.state.timeLeft = val;
                            localStorage.setItem('nk-stage-timer-duration', val.toString());

                            this.updateStatusText('Ready');
                        };

                        input.onkeydown = (e) => {
                            if (e.key === 'Enter') {
                                input.blur();
                                this.start();
                            }
                        };
                    },

                    setupDrag(widget) {
                        let startX, startY, initialTop, initialRight;
                        let hasMoved = false;

                        const onMouseDown = (e) => {
                            // Don't drag if clicking on input
                            if (e.target.tagName === 'INPUT') return;

                            hasMoved = false;
                            this.state.dragData.isDragging = true;

                            startX = e.clientX;
                            startY = e.clientY;

                            const rect = widget.getBoundingClientRect();
                            initialTop = rect.top;
                            initialRight = window.innerWidth - rect.right;

                            widget.style.transition = 'none';
                            widget.style.cursor = 'grabbing';

                            document.addEventListener('mousemove', onMouseMove);
                            document.addEventListener('mouseup', onMouseUp);

                            e.preventDefault();
                        };

                        const onMouseMove = (e) => {
                            if (!this.state.dragData.isDragging) return;

                            const deltaX = e.clientX - startX;
                            const deltaY = e.clientY - startY;

                            if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
                                hasMoved = true;
                            }

                            const newTop = initialTop + deltaY;
                            const newRight = initialRight - deltaX;

                            // Constrain to viewport
                            const maxTop = window.innerHeight - widget.offsetHeight - 20;
                            const maxRight = window.innerWidth - widget.offsetWidth - 20;

                            widget.style.top = Math.max(20, Math.min(newTop, maxTop)) + 'px';
                            widget.style.right = Math.max(20, Math.min(newRight, maxRight)) + 'px';
                        };

                        const onMouseUp = () => {
                            this.state.dragData.isDragging = false;
                            widget.style.transition = '';
                            widget.style.cursor = 'grab';

                            // Save position
                            if (hasMoved) {
                                localStorage.setItem('nk-stage-timer-position', JSON.stringify({
                                    top: widget.style.top,
                                    right: widget.style.right
                                }));
                            }

                            document.removeEventListener('mousemove', onMouseMove);
                            document.removeEventListener('mouseup', onMouseUp);

                            setTimeout(() => { hasMoved = false; }, 100);
                        };

                        widget.addEventListener('mousedown', onMouseDown);
                    },

                    toggleRun() {
                        if (this.state.isRunning) {
                            this.stop();
                        } else {
                            // If finished, reset first
                            if (this.state.timeLeft <= 0) {
                                this.reset();
                            }
                            this.start();
                        }
                    },

                    start() {
                        const widget = document.getElementById('stage-timer-widget');
                        const input = document.getElementById('stage-timer-input');
                        const visual = document.getElementById('stage-timer-display-visual');

                        // Save the current duration when starting
                        const currentVal = parseInt(input.value);
                        if (!isNaN(currentVal) && currentVal > 0) {
                            this.state.duration = currentVal;
                            this.state.timeLeft = currentVal;
                            localStorage.setItem('nk-stage-timer-duration', currentVal.toString());
                        }

                        if (this.state.timeLeft <= 0) this.state.timeLeft = this.state.duration;

                        this.state.isRunning = true;
                        widget?.classList.add('running');
                        widget?.classList.remove('finished');
                        this.updateStatusText('Running');

                        // Initial Visual Update
                        if (visual) {
                            visual.innerHTML = `<span class="stage-timer-digit">${this.state.timeLeft}</span>`;
                        }

                        if (this.state.interval) clearInterval(this.state.interval);

                        this.state.interval = setInterval(() => {
                            this.state.timeLeft--;

                            // Update Visual Display with animation
                            if (visual) {
                                // Re-injecting HTML forces animation restart
                                visual.innerHTML = `<span class="stage-timer-digit">${this.state.timeLeft}</span>`;
                            }

                            // Keep input synced in background just in case
                            if (input) {
                                input.value = this.state.timeLeft;
                            }

                            // Update Progress Ring
                            this.updateProgress();

                            // Play subtle tick sound each second
                            this.playTickSound();

                            if (this.state.timeLeft <= 0) {
                                this.finish();
                            }
                        }, 1000);
                    },

                    updateProgress() {
                        const widget = document.getElementById('stage-timer-widget');
                        const progressCircle = widget?.querySelector('.stage-timer-progress-fg');

                        if (progressCircle && this.state.duration > 0) {
                            const percent = this.state.timeLeft / this.state.duration;
                            const circumference = 283;
                            const offset = circumference - (percent * circumference);
                            progressCircle.style.strokeDashoffset = offset;

                            // Critical state (last 25%)
                            if (percent <= 0.25) {
                                widget.classList.add('critical');
                            } else {
                                widget.classList.remove('critical');
                            }
                        }
                    },

                    stop() {
                        this.state.isRunning = false;
                        const widget = document.getElementById('stage-timer-widget');
                        widget?.classList.remove('running');
                        // Don't remove critical class here so it stays red if paused in critical zone

                        this.updateStatusText(this.state.timeLeft <= 0 ? 'Finished' : 'Paused');

                        if (this.state.interval) clearInterval(this.state.interval);
                        this.state.interval = null;
                    },

                    reset() {
                        this.stop();
                        this.state.timeLeft = this.state.duration;
                        const input = document.getElementById('stage-timer-input');
                        const widget = document.getElementById('stage-timer-widget');
                        if (input) input.value = this.state.timeLeft;
                        widget?.classList.remove('finished');
                        widget?.classList.remove('critical');

                        // Reset ring
                        const progressCircle = widget?.querySelector('.stage-timer-progress-fg');
                        if (progressCircle) progressCircle.style.strokeDashoffset = 0;

                        const label = widget?.querySelector('.stage-timer-label');
                        if (label) label.textContent = 'TIMER';
                        this.updateStatusText('Ready');
                    },

                    finish() {
                        this.stop();
                        const widget = document.getElementById('stage-timer-widget');
                        const visual = document.getElementById('stage-timer-display-visual');
                        const label = widget?.querySelector('.stage-timer-label');
                        const status = widget?.querySelector('.stage-timer-status span'); // Select the text span within status

                        widget?.classList.add('finished');
                        widget?.classList.add('critical'); // Ensure fully red

                        // Reset Label to Timer (user wanted "Time's Up" at bottom)
                        if (label) {
                            label.textContent = "TIMER";
                            label.style.opacity = '1'; // Ensure visible on finish
                            label.style.transform = 'translateY(0)';
                        }

                        // Set Bottom Text
                        if (status) status.textContent = "TIME'S UP";

                        // Ensure ring is empty
                        const progressCircle = widget?.querySelector('.stage-timer-progress-fg');
                        if (progressCircle) progressCircle.style.strokeDashoffset = 283;

                        // Keep visual visible but change style slightly via class
                        if (visual) {
                            visual.innerHTML = `<span class="stage-timer-digit" style="color: var(--danger-color);">0</span>`;
                        }

                        this.playCompletionChime();
                    },

                    // Shared AudioContext for better performance
                    getAudioContext() {
                        if (!this.audioContext) {
                            const AudioContext = window.AudioContext || window.webkitAudioContext;
                            if (!AudioContext) return null;
                            this.audioContext = new AudioContext();
                        }
                        return this.audioContext;
                    },

                    playTickSound() {
                        try {
                            const ctx = this.getAudioContext();
                            if (!ctx) return;

                            // Subtle analog clock tick sound
                            const osc = ctx.createOscillator();
                            const gain = ctx.createGain();

                            osc.connect(gain);
                            gain.connect(ctx.destination);

                            // High frequency for crisp tick
                            osc.type = 'sine';
                            osc.frequency.setValueAtTime(1200, ctx.currentTime);

                            gain.gain.setValueAtTime(0.08, ctx.currentTime);
                            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.03);

                            osc.start(ctx.currentTime);
                            osc.stop(ctx.currentTime + 0.03);
                        } catch (e) {
                            console.error('Tick sound error:', e);
                        }
                    },

                    playCompletionChime() {
                        try {
                            const ctx = this.getAudioContext();
                            if (!ctx) return;

                            // Create a pleasant melodic chime with harmonious tones
                            const masterGain = ctx.createGain();
                            masterGain.connect(ctx.destination);
                            masterGain.gain.setValueAtTime(0.55, ctx.currentTime);
                            masterGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.6);

                            // Three harmonically related frequencies (C major chord: C5, E5, G5)
                            const frequencies = [523.25, 659.25, 783.99];
                            const delays = [0, 0.08, 0.16];

                            frequencies.forEach((freq, i) => {
                                const osc = ctx.createOscillator();
                                const gain = ctx.createGain();

                                osc.connect(gain);
                                gain.connect(masterGain);

                                osc.type = 'sine';
                                osc.frequency.setValueAtTime(freq, ctx.currentTime);

                                const startTime = ctx.currentTime + delays[i];
                                gain.gain.setValueAtTime(0.3, startTime);
                                gain.gain.exponentialRampToValueAtTime(0.01, startTime + 1.4);

                                osc.start(startTime);
                                osc.stop(startTime + 1.6);
                            });

                        } catch (e) {
                            console.error('Timer audio error:', e);
                        }
                    },

                    updateStatusText(text) {
                        const el = document.getElementById('stage-timer-status');
                        if (!el) return;

                        let icon = '';
                        if (text === 'Running') icon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/></svg>`;
                        else if (text === 'Ready' || text === 'Paused') icon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M10.804 8 5 4.633v6.734L10.804 8zm.792-.696a.802.802 0 0 1 0 1.392l-6.363 3.692C4.713 12.69 4 12.345 4 11.692V4.308c0-.653.713-.998 1.233-.696l6.363 3.692z"/></svg>`;
                        else if (text === 'Time\'s Up!' || text === 'Done') icon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/></svg>`;
                        else icon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z"/></svg>`;

                        // Show only icon when running (no text)
                        if (text === 'Running') {
                            el.innerHTML = icon;
                            el.style.justifyContent = 'center';
                        } else {
                            el.innerHTML = `${icon} <span>${text}</span>`;
                            el.style.justifyContent = '';
                        }
                    }
                },
                presentation: {
                    state: { duration: 10, timeLeft: 10, interval: null, isRunning: false },

                    toggle() {
                        const overlay = document.getElementById('focus-mode-overlay');
                        if (!overlay) return;

                        let widget = document.getElementById('stage-timer-widget');
                        if (!widget) {
                            this.render(overlay);
                            widget = document.getElementById('stage-timer-widget');
                            void widget.offsetWidth;
                            widget.classList.add('visible');
                        } else {
                            if (widget.classList.contains('hidden')) {
                                widget.classList.remove('hidden');
                                widget.style.display = 'flex';
                                requestAnimationFrame(() => {
                                    widget.style.opacity = '1';
                                    widget.style.transform = 'scale(1)';
                                });
                            } else {
                                widget.style.opacity = '0';
                                widget.style.transform = 'scale(0.9)';
                                setTimeout(() => {
                                    widget.classList.add('hidden');
                                    widget.style.display = 'none';
                                }, 300);
                            }
                        }
                    },

                    render(overlay) {
                        const div = document.createElement('div');
                        div.id = 'stage-timer-widget';
                        div.className = 'stage-timer-widget';
                        div.innerHTML = `
                             <div class="stage-timer-header">
                                <span class="stage-timer-label">Timer</span>
                                <div class="stage-timer-presets">
                                    <div class="stage-timer-preset" onclick="App.events.stageTimer.setDuration(10)">10s</div>
                                    <div class="stage-timer-preset" onclick="App.events.stageTimer.setDuration(30)">30s</div>
                                    <div class="stage-timer-preset" onclick="App.events.stageTimer.setDuration(60)">1m</div>
                                </div>
                            </div>
                            <div class="stage-timer-display" id="stage-timer-display">10</div>
                            <div class="stage-timer-controls">
                                <button class="stage-timer-btn" onclick="App.events.stageTimer.reset()" title="Reset" id="stage-timer-reset-btn">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                </button>
                                <button class="stage-timer-btn primary" id="stage-timer-action-btn" onclick="App.events.stageTimer.toggleRun()">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>
                                </button>
                            </div>
                        `;
                        overlay.appendChild(div);
                        this.updateDisplay();
                    },

                    setDuration(seconds) {
                        this.stop();
                        this.state.duration = seconds;
                        this.state.timeLeft = seconds;
                        this.updateDisplay();
                    },

                    toggleRun() {
                        if (this.state.isRunning) {
                            this.stop();
                        } else {
                            this.start();
                        }
                    },

                    start() {
                        if (this.state.timeLeft <= 0) this.state.timeLeft = this.state.duration;
                        this.state.isRunning = true;
                        this.updateBtnState();

                        // Play a soft start sound? Maybe not needed.
                        if (this.state.interval) clearInterval(this.state.interval);

                        this.state.interval = setInterval(() => {
                            this.state.timeLeft--;
                            this.updateDisplay(true); // pass true to animate

                            if (this.state.timeLeft <= 0) {
                                this.finish();
                            }
                        }, 1000);
                    },

                    stop() {
                        this.state.isRunning = false;
                        if (this.state.interval) clearInterval(this.state.interval);
                        this.state.interval = null;
                        this.updateBtnState();
                    },

                    reset() {
                        this.stop();
                        this.state.timeLeft = this.state.duration;
                        this.updateDisplay(); // no animation on reset
                    },

                    finish() {
                        this.stop();
                        this.playCompletionSound();

                        // Aesthetic completion effect
                        const display = document.getElementById('stage-timer-display');
                        const widget = document.getElementById('stage-timer-widget');
                        if (widget) {
                            widget.style.boxShadow = '0 0 40px rgba(var(--danger-color-rgb), 0.5), 0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                            widget.style.borderColor = 'var(--danger-color)';

                            const oldColor = display.style.color;
                            display.style.color = 'var(--danger-color)';

                            // Pulse animation for widget
                            widget.animate([
                                { transform: 'scale(1)' },
                                { transform: 'scale(1.05)' },
                                { transform: 'scale(1)' }
                            ], { duration: 300, iterations: 2 });

                            setTimeout(() => {
                                widget.style.boxShadow = '';
                                widget.style.borderColor = '';
                                display.style.color = oldColor;
                            }, 2500);
                        }
                    },

                    playCompletionSound() {
                        try {
                            const AudioContext = window.AudioContext || window.webkitAudioContext;
                            if (!AudioContext) return;
                            const ctx = new AudioContext();

                            const playTone = (freq, type, duration, delay, vol = 0.2) => {
                                const osc = ctx.createOscillator();
                                const gain = ctx.createGain();
                                osc.connect(gain);
                                gain.connect(ctx.destination);
                                osc.type = type;
                                osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
                                gain.gain.setValueAtTime(vol, ctx.currentTime + delay);
                                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration);
                                osc.start(ctx.currentTime + delay);
                                osc.stop(ctx.currentTime + delay + duration);
                            };

                            // "Beep Beep" - Pleasant but alert
                            // E5 then E5
                            playTone(659.25, 'sine', 0.15, 0, 0.3);
                            setTimeout(() => playTone(659.25, 'sine', 0.4, 0), 200);

                        } catch (e) { console.error("Audio error", e); }
                    },

                    updateDisplay(animate = false) {
                        const el = document.getElementById('stage-timer-display');
                        if (!el) return;

                        el.textContent = this.state.timeLeft;

                        if (animate && this.state.timeLeft > 0) {
                            el.classList.remove('animate');
                            void el.offsetWidth; // force reflow
                            el.classList.add('animate');
                        }
                    },

                    updateBtnState() {
                        const btn = document.getElementById('stage-timer-action-btn');
                        if (!btn) return;
                        if (this.state.isRunning) {
                            // Pause/Stop icon
                            btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>`;
                            btn.title = "Stop";
                        } else {
                            // Play icon
                            btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>`;
                            btn.title = "Start";
                        }
                    }
                },
                presentation: {
                    themes: [
                        'default',
                        'lime-ink', 'goldenrod-pad', 'mint-chip', 'aqua-sky', 'peach-sorbet', 'powder-snow',
                        'terminal', 'crimson-night', 'royal-indigo', 'emerald-tablet', 'obsidian-ruby', 'blueprint', 'midnight-sun',
                        'evergreen', 'clay-sky', 'sandstone-agave', 'stone-moss', 'mahogany', 'riverbed', 'matrix',
                        'rosewater', 'azure-depth', 'olive-grove', 'sterling', 'greyscale',
                        'neon-abyss', 'solar-eclipse', 'deep-ocean', 'cloud-nine'
                    ],
                    currentThemeIndex: 0,
                    currentSnippetIndex: -1,
                    _proPresenterState: { isActive: false, elements: {}, listeners: {} },
                    toggleProPresenter() {
                        const isPremium = App.license.isPremium();
                        if (!isPremium) {
                            App.ui.showAscensionModal('proPresenter');
                            return;
                        }
                        const state = this._proPresenterState;
                        state.isActive = !state.isActive;
                        App.state.focusSession.isProPresenterActive = state.isActive; // keeping state persistent

                        const btn = document.getElementById('pro-presenter-toggle-btn');
                        if (btn) btn.classList.toggle('active', state.isActive);

                        document.body.classList.toggle('is-pro-presenter-active', state.isActive);

                        if (state.isActive) {
                            // Automatically activate Stage Mode if it's not already active to ensure a presentation-like layout
                            // FIX: Only force Stage Mode if we are actually in a Focus Session
                            if (App.state.focusSession?.isActive && !App.state.focusSession?.isStageMode) {
                                App.events.toggleStageMode();
                            }
                            this._initProPresenter();
                            App.ui.showToast('Pro Presenter Mode Activated', 'success');
                        } else {
                            this._cleanupProPresenter();
                            App.ui.showToast('Pro Presenter Mode Deactivated', 'info');
                        }
                    },
                    _initProPresenter() {
                        const state = this._proPresenterState;
                        // Removed mandatory overlay check for Read Mode compatibility


                        // Set the Pro Presenter border mode on body
                        const currentMode = App.settings.get('proPresenterMode') || 'living-cell';
                        document.body.setAttribute('data-pro-presenter-mode', currentMode);


                        // Create Wave Overlay (Idempotent)
                        if (!state.elements.waveOverlay) {
                            const waveOverlay = document.createElement('div');
                            waveOverlay.className = 'pro-presenter-wave-overlay';
                            waveOverlay.innerHTML = `
                                <svg class="pro-wave pro-wave-top" preserveAspectRatio="none" viewBox="0 0 1440 100" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0,50 C320,100 420,0 740,50 C1060,100 1120,0 1440,50 L1440,0 L0,0 Z"></path>
                                </svg>
                                <svg class="pro-wave pro-wave-bottom" preserveAspectRatio="none" viewBox="0 0 1440 100" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0,50 C320,0 420,100 740,50 C1060,0 1120,100 1440,50 L1440,100 L0,100 Z"></path>
                                </svg>
                            `;
                            document.body.appendChild(waveOverlay);
                            state.elements.waveOverlay = waveOverlay;
                        }

                        // Create Cursor Glow (Idempotent)
                        if (!state.elements.cursorGlow) {
                            const cursorGlow = document.createElement('div');
                            cursorGlow.className = 'pro-presenter-cursor-glow';
                            document.body.appendChild(cursorGlow);
                            state.elements.cursorGlow = cursorGlow;
                        }

                        // Create Watermark (Idempotent)
                        if (!state.elements.watermark) {
                            let brandNameText = App.settings.get('brandName');
                            if (!brandNameText || brandNameText.trim() === '') brandNameText = 'PRO PRESENTER';
                            const watermark = document.createElement('div');
                            watermark.className = 'pro-presenter-watermark';
                            watermark.textContent = brandNameText;
                            document.body.appendChild(watermark);
                            state.elements.watermark = watermark;
                        }

                        // Create Progress Bar (Idempotent - ensure it exists in DOM)
                        if (!state.elements.progressContainer || !document.body.contains(state.elements.progressContainer)) {
                            // If it exists in state but not in DOM, remove old reference
                            if (state.elements.progressContainer && state.elements.progressContainer.parentNode) {
                                state.elements.progressContainer.parentNode.removeChild(state.elements.progressContainer);
                            }

                            const progressContainer = document.createElement('div');
                            progressContainer.className = 'pro-presenter-progress-container';
                            const progressBar = document.createElement('div');
                            progressBar.className = 'pro-presenter-progress-bar';
                            progressContainer.appendChild(progressBar);
                            document.body.appendChild(progressContainer);
                            state.elements.progressBar = progressBar;
                            state.elements.progressContainer = progressContainer;
                        }

                        // Mouse Move Listener with Fire Tail & Dynamic Shadows
                        if (!state.listeners.mousemove) {
                            // Create sleek-trace spotlight layer (idempotent)
                            if (!state.elements.spotlight) {
                                const spotlight = document.createElement('div');
                                spotlight.className = 'sleek-trace-spotlight';
                                document.body.appendChild(spotlight);
                                state.elements.spotlight = spotlight;
                            }

                            let lastX = 0, lastY = 0, lastTime = Date.now();

                            state.listeners.mousemove = (e) => {
                                const now = Date.now();
                                const dt = Math.max(now - lastTime, 1);
                                const dx = e.clientX - lastX;
                                const dy = e.clientY - lastY;
                                const speed = Math.sqrt(dx * dx + dy * dy) / dt;

                                const glow = state.elements.cursorGlow;
                                if (glow) {
                                    glow.style.left = `${e.clientX}px`;
                                    glow.style.top = `${e.clientY}px`;
                                }
                                const spot = state.elements.spotlight;
                                if (spot) {
                                    spot.style.left = `${e.clientX}px`;
                                    spot.style.top = `${e.clientY}px`;
                                }

                                lastX = e.clientX;
                                lastY = e.clientY;
                                lastTime = now;
                            };
                            document.addEventListener('mousemove', state.listeners.mousemove);
                        }

                        // Robust Scrolling Fix: Capture wheel events on window and pass to scrollable container
                        if (!state.listeners.wheel) {
                            state.listeners.wheel = (e) => {
                                if (!this._proPresenterState.isActive) return;
                                // In Read Mode (no overlay), we let natural scroll handle it, 
                                // unless we explicitly want to intercept for components.
                                const overlay = document.getElementById('focus-mode-overlay');
                                if (!overlay) return;
                                const scrollEl = App.state.focusSession?.isStageMode ?
                                    overlay.querySelector('.focus-mode-content') :
                                    overlay.querySelector('.focus-mode-body');
                                if (scrollEl) {
                                    scrollEl.scrollTop += e.deltaY;
                                }
                            };
                            window.addEventListener('wheel', state.listeners.wheel, { passive: true });
                        }

                        // Click Ripple + Cursor Pop-scale Listener
                        if (!state.listeners.click) {
                            state.listeners.click = (e) => {
                                // --- Ripple ---
                                const ripple = document.createElement('div');
                                ripple.className = 'pro-presenter-ripple';
                                const size = 60;
                                ripple.style.left = `${e.clientX - size / 2}px`;
                                ripple.style.top = `${e.clientY - size / 2}px`;
                                ripple.style.width = `${size}px`;
                                ripple.style.height = `${size}px`;
                                document.body.appendChild(ripple);
                                setTimeout(() => {
                                    if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
                                }, 800);

                                // --- Cursor pop-scale burst ---
                                const glow = state.elements.cursorGlow;
                                if (glow) {
                                    glow.classList.add('is-clicking');
                                    setTimeout(() => glow.classList.remove('is-clicking'), 200);
                                }

                                // --- Wave Overlay react ---
                                const waveOverlay = document.querySelector('.pro-presenter-wave-overlay');
                                if (waveOverlay) {
                                    waveOverlay.classList.add('is-clicking');
                                    setTimeout(() => waveOverlay.classList.remove('is-clicking'), 400);
                                }
                            };
                            document.addEventListener('click', state.listeners.click);
                        }

                        // Scroll Progress Listener (Always update to new scrollEl)
                        // STAGE MODE FIX: In stage mode, .focus-mode-content scrolls. In snippets/sigma mode, .focus-mode-body scrolls.
                        // READ MODE: Root documentElement scrolls.
                        const overlay = document.getElementById('focus-mode-overlay');
                        const scrollEl = overlay ?
                            (App.state.focusSession?.isStageMode ? overlay.querySelector('.focus-mode-content') : overlay.querySelector('.focus-mode-body')) :
                            document.documentElement;

                        if (scrollEl) {
                            // Cleanup old scroll listener if exists on a different element
                            if (state.listeners.scroll && state.elements.scrollEl && state.elements.scrollEl !== scrollEl) {
                                state.elements.scrollEl.removeEventListener('scroll', state.listeners.scroll);
                            }

                            state.listeners.scroll = () => {
                                const scrollTop = scrollEl.scrollTop;
                                const scrollHeight = scrollEl.scrollHeight - scrollEl.clientHeight;
                                const scrollPercent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
                                if (state.elements.progressBar) {
                                    state.elements.progressBar.style.width = scrollPercent + "%";
                                }
                            };
                            scrollEl.addEventListener('scroll', state.listeners.scroll);
                            state.elements.scrollEl = scrollEl;

                            // Initialize position immediately
                            state.listeners.scroll();
                        }
                    },
                    _cleanupProPresenter() {
                        const state = this._proPresenterState;
                        if (state.elements.waveOverlay && state.elements.waveOverlay.parentNode) {
                            state.elements.waveOverlay.parentNode.removeChild(state.elements.waveOverlay);
                        }
                        if (state.elements.cursorGlow && state.elements.cursorGlow.parentNode) {
                            state.elements.cursorGlow.parentNode.removeChild(state.elements.cursorGlow);
                        }
                        if (state.elements.spotlight && state.elements.spotlight.parentNode) {
                            state.elements.spotlight.parentNode.removeChild(state.elements.spotlight);
                        }

                        if (state.elements.progressContainer && state.elements.progressContainer.parentNode) {
                            state.elements.progressContainer.parentNode.removeChild(state.elements.progressContainer);
                        }
                        if (state.elements.watermark && state.elements.watermark.parentNode) {
                            state.elements.watermark.parentNode.removeChild(state.elements.watermark);
                        }
                        if (state.listeners.mousemove) document.removeEventListener('mousemove', state.listeners.mousemove);
                        if (state.listeners.click) document.removeEventListener('click', state.listeners.click);
                        if (state.listeners.wheel) window.removeEventListener('wheel', state.listeners.wheel);
                        if (state.listeners.scroll && state.elements.scrollEl) {
                            state.elements.scrollEl.removeEventListener('scroll', state.listeners.scroll);
                        }

                        // Clean up body ambiance and specific mode data
                        document.body.className = document.body.className.replace(/\bambiance-\S+/g, '').trim();
                        document.body.removeAttribute('data-pro-presenter-mode');

                        state.elements = {};
                        state.listeners = {};
                    },
                    _revealFirstVisibleSnippet() {
                        const overlay = document.getElementById('focus-mode-overlay');
                        if (!overlay) return;

                        const allItems = Array.from(overlay.querySelectorAll('.snippet, .nk-mcq-block, .nk-timeline-block, .chart-container, .nk-accordion'));

                        const visibleItems = allItems.filter(el => el.classList.contains('is-visible'));

                        if (visibleItems.length > 0) {
                            const firstItemOnNewSlide = visibleItems[0];
                            // Un-reveal everything first
                            allItems.forEach(item => item.classList.remove('is-revealing', 'spotlight-key-focus'));
                            // Reveal just the first one on the new slide
                            firstItemOnNewSlide.classList.add('is-revealing', 'spotlight-key-focus');
                            App.events.typewriter.start(firstItemOnNewSlide);
                        }
                    },

                    cycleAmbiance(goBack = false) {
                        const session = App.state.focusSession;
                        if (!session.isActive) return;

                        const overlay = document.getElementById('focus-mode-overlay');
                        if (!overlay) return;

                        const currentIndex = this.themes.indexOf(session.activeTheme);
                        const nextIndex = goBack
                            ? (currentIndex - 1 + this.themes.length) % this.themes.length
                            : (currentIndex + 1) % this.themes.length;
                        const newTheme = this.themes[nextIndex];

                        // Manually remove any old theme classes
                        overlay.className = overlay.className.replace(/\bambiance-\S+/g, '').trim();

                        if (newTheme !== 'default') {
                            overlay.classList.add(`ambiance-${newTheme}`);
                        }

                        session.activeTheme = newTheme;

                        const themeName = newTheme.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        App.ui.showToast(`${themeName}`, { type: 'info', duration: 1500 });

                        // SYNC BODY THEME (Persistence for Pro Presenter)
                        document.body.className = document.body.className.replace(/\bambiance-\S+/g, '').trim();
                        if (newTheme !== 'default') {
                            document.body.classList.add(`ambiance-${newTheme}`);
                        }
                    },

                    // This function now correctly resets the theme using direct, reliable logic.
                    resetAmbiance() {
                        const session = App.state.focusSession;
                        if (!session.isActive) return;

                        const overlay = document.getElementById('focus-mode-overlay');
                        if (!overlay) return;

                        overlay.className = overlay.className.replace(/\bambiance-\S+/g, '').trim();
                        session.activeTheme = 'default';

                        App.ui.showToast('Theme reset to default', { type: 'success', duration: 2000 });

                        // SYNC BODY THEME
                        document.body.className = document.body.className.replace(/\bambiance-\S+/g, '').trim();
                    },

                    toggleCinematicMotion(buttonEl) {
                        const session = App.state.focusSession;
                        if (!session.isActive) return;
                        session.isCinematicActive = !session.isCinematicActive;
                        const overlay = document.getElementById('focus-mode-overlay');
                        overlay?.classList.toggle('cinematic-active', session.isCinematicActive);
                        if (buttonEl) buttonEl.classList.toggle('active', session.isCinematicActive);
                        const currentSlideSnippets = session.isStageMode
                            ? Array.from(overlay.querySelectorAll('.snippet.is-visible, .nk-mcq-block.is-visible'))
                            : Array.from(overlay.querySelectorAll('.snippet, .nk-mcq-block'));

                        // Reliability Polish: Clear any old spotlights when toggling
                        overlay.querySelectorAll('.spotlight-key-focus').forEach(el => el.classList.remove('spotlight-key-focus'));

                        if (session.isCinematicActive) {
                            currentSlideSnippets.forEach(s => s.classList.remove('is-revealing'));
                            this.currentSnippetIndex = -1;
                            this.navigateCinematic(1); // Reveal first snippet
                            App.ui.showToast('Cinematic Reveal Enabled', { type: 'info' });
                        } else {
                            currentSlideSnippets.forEach(s => s.classList.add('is-revealing'));
                            App.events.typewriter.reset();
                            App.ui.showToast('Cinematic Reveal Disabled', { type: 'info' });
                        }
                    },

                    navigateCinematic(direction) {
                        const overlay = document.getElementById('focus-mode-overlay');

                        const snippets = Array.from(overlay.querySelectorAll('.snippet.is-visible, .nk-mcq-block.is-visible, .nk-accordion.is-visible'));

                        if (snippets.length === 0) return;

                        // Clear any previous spotlight
                        overlay.querySelectorAll('.spotlight-key-focus').forEach(el => el.classList.remove('spotlight-key-focus'));

                        let newIndex = this.currentSnippetIndex + direction;

                        // Clamp the new index to be within the valid range of snippets
                        newIndex = Math.max(0, Math.min(snippets.length - 1, newIndex));

                        const targetSnippet = snippets[newIndex];

                        if (targetSnippet) {
                            snippets.forEach(s => s.classList.remove('is-revealing'));
                            targetSnippet.classList.add('is-revealing');

                            // Add the spotlight effect to the newly revealed snippet
                            targetSnippet.classList.add('spotlight-key-focus');
                            targetSnippet.scrollIntoView({ behavior: 'smooth', block: 'center' });

                            // Apply the typewriter effect
                            App.events.typewriter.start(targetSnippet);
                        }

                        this.currentSnippetIndex = newIndex;
                    },


                    _handleTeleprompterDragStart(e) {
                        e.preventDefault();
                        e.stopPropagation();

                        const resizer = document.getElementById('teleprompter-resizer');
                        if (resizer) resizer.classList.add('is-resizing');

                        document.addEventListener('mousemove', App.events.presentation._handleTeleprompterDrag);
                        document.addEventListener('mouseup', App.events.presentation._handleTeleprompterDragEnd);
                        document.addEventListener('touchmove', App.events.presentation._handleTeleprompterDrag, { passive: false });
                        document.addEventListener('touchend', App.events.presentation._handleTeleprompterDragEnd);
                    },

                    _handleTeleprompterDrag(e) {
                        e.preventDefault();
                        e.stopPropagation();

                        const session = App.state.focusSession;
                        if (!session.teleprompterActive) return;

                        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

                        const sidebar = document.getElementById('teleprompter-sidebar');
                        const content = document.querySelector('.focus-mode-overlay.teleprompter-active .focus-mode-content');
                        if (!sidebar || !content) return;

                        let newPercentage = 30;

                        if (document.body.classList.contains('mobile-view')) {
                            // Mobile: Vertical resize (based on height)
                            const headerHeight = document.querySelector('header')?.offsetHeight || 48;
                            const newHeight = clientY - headerHeight;
                            newPercentage = (newHeight / window.innerHeight) * 100;
                            newPercentage = Math.max(15, Math.min(85, newPercentage)); // Clamp between 15% and 85% height

                            sidebar.style.height = `${100 - newPercentage}%`;
                            content.style.height = `${newPercentage}%`;
                        } else {
                            // Desktop: Horizontal resize (based on width)
                            newPercentage = (clientX / window.innerWidth) * 100;
                            newPercentage = Math.max(15, Math.min(60, newPercentage)); // Clamp between 15% and 60% width

                            sidebar.style.width = `${newPercentage}%`;
                            content.style.width = `${100 - newPercentage}%`;
                        }

                        session.teleprompterSize = newPercentage;

                        // Recalculate stage mode layout *after* the DOM has updated
                        requestAnimationFrame(() => {
                            const bodyEl = document.querySelector('.focus-mode-body');
                            if (bodyEl && session.isStageMode) {
                                session.scrollStops = App.ui._calculateScrollStops(bodyEl);
                            }
                        });
                    },

                    _handleTeleprompterDragEnd(e) {
                        const resizer = document.getElementById('teleprompter-resizer');
                        if (resizer) resizer.classList.remove('is-resizing');

                        document.removeEventListener('mousemove', App.events.presentation._handleTeleprompterDrag);
                        document.removeEventListener('mouseup', App.events.presentation._handleTeleprompterDragEnd);
                        document.removeEventListener('touchmove', App.events.presentation._handleTeleprompterDrag);
                        document.removeEventListener('touchend', App.events.presentation._handleTeleprompterDragEnd);

                        // Final recalculation to ensure scroll stops are perfect
                        const session = App.state.focusSession;
                        const bodyEl = document.querySelector('.focus-mode-body');
                        if (bodyEl && session.isStageMode) {
                            session.scrollStops = App.ui._calculateScrollStops(bodyEl);
                        }
                    },

                    adjustTeleprompterFont(delta) {
                        const session = App.state.focusSession;
                        const sidebar = document.getElementById('teleprompter-sidebar');
                        if (!session.isActive || !session.teleprompterActive || !sidebar) return;
                        const currentSizeString = getComputedStyle(sidebar).getPropertyValue('--teleprompter-font-size') || '1.1rem';

                        let currentSizeNum = parseFloat(currentSizeString);
                        if (isNaN(currentSizeNum)) {
                            currentSizeNum = 1.1;
                        }
                        let newSize = currentSizeNum + delta;
                        newSize = Math.max(0.5, Math.min(3.0, newSize)); // Clamp size

                        session.teleprompterFontSize = newSize; // Store the new number
                        sidebar.style.setProperty('--teleprompter-font-size', `${newSize}rem`);
                    },

                    toggleTeleprompter() {
                        const session = App.state.focusSession;
                        if (!session.isActive) return;

                        session.teleprompterActive = !session.teleprompterActive;
                        const overlay = document.getElementById('focus-mode-overlay');
                        const toggleBtn = document.getElementById('teleprompter-toggle-btn');
                        const contentEl = overlay.querySelector('.focus-mode-content');

                        overlay.classList.toggle('teleprompter-active', session.teleprompterActive);
                        if (toggleBtn) {
                            toggleBtn.classList.toggle('active', session.teleprompterActive);
                        }

                        let sidebar = document.getElementById('teleprompter-sidebar');

                        if (session.teleprompterActive) {
                            if (!sidebar) {
                                sidebar = document.createElement('div');
                                sidebar.id = 'teleprompter-sidebar';
                                overlay.insertBefore(sidebar, contentEl);
                            }

                            const size = session.teleprompterSize || 30;
                            const contentSize = 100 - size;

                            if (document.body.classList.contains('mobile-view')) {
                                // Mobile: Apply height
                                sidebar.style.height = `${contentSize}%`; // Teleprompter is on bottom
                                contentEl.style.height = `${size}%`;     // Content is on top
                            } else {
                                // Desktop: Apply width
                                sidebar.style.width = `${size}%`;
                                contentEl.style.width = `${contentSize}%`;
                            }

                            sidebar.style.setProperty('--teleprompter-font-size', `${session.teleprompterFontSize}rem`);

                            const article = App.storage.getArticle(session.articles[session.currentIndex].id);
                            if (article && article.content) {
                                let parsedContent = App.util.parseShortcuts(article.content);
                                let teleprompterFriendlyContent = App.util._transformMcqsForTeleprompter(parsedContent);
                                teleprompterFriendlyContent = App.util._transformAccordionsForTeleprompter(teleprompterFriendlyContent);
                                let finalContentHTML = App.util.sanitizeForTeleprompter(teleprompterFriendlyContent);

                                sidebar.innerHTML = finalContentHTML;
                            } else {
                                sidebar.innerHTML = "<p>Could not load article content.</p>";
                            }

                            const controlsHTML = `
                            <div id="teleprompter-controls">
                                <button class="btn-icon" id="tp-font-dec" onclick="App.events.presentation.adjustTeleprompterFont(-0.1)" title="Decrease Font Size (-)">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M1 8a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13A.5.5 0 0 1 1 8z"/></svg>
                                </button>
                                <button class="btn-icon" id="tp-font-inc" onclick="App.events.presentation.adjustTeleprompterFont(0.1)" title="Increase Font Size (+)">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/></svg>
                                </button>
                            </div>
                        `;
                            sidebar.insertAdjacentHTML('afterbegin', controlsHTML);

                            const resizer = document.createElement('div');
                            resizer.id = 'teleprompter-resizer';
                            sidebar.appendChild(resizer); // Append to sidebar for correct positioning

                            resizer.addEventListener('mousedown', App.events.presentation._handleTeleprompterDragStart);
                            resizer.addEventListener('touchstart', App.events.presentation._handleTeleprompterDragStart, { passive: false });

                            App.ui.showToast('Teleprompter On', 'info');

                        } else {
                            if (sidebar) {
                                sidebar.remove(); // This removes the sidebar and its child resizer
                            }
                            if (document.body.classList.contains('mobile-view')) {
                                contentEl.style.height = '100%';
                            } else {
                                contentEl.style.width = '100%';
                            }

                            App.ui.showToast('Teleprompter Off', 'info');
                        }

                        setTimeout(() => {
                            const bodyEl = overlay.querySelector('.focus-mode-body');
                            if (bodyEl) {
                                session.scrollStops = App.ui._calculateScrollStops(bodyEl);
                                bodyEl.scrollTo({ top: session.scrollStops[session.currentSlideIndex], behavior: 'auto' });
                            }
                        }, 100);
                    },
                },

                // --- Annotation Namespace for Stage Mode ---
                annotation: {
                    async toggleWhiteboard() {
                        // Close if already open
                        if (App.whiteboard.state.isOpen) {
                            App.whiteboard.close();
                            return;
                        }

                        const session = App.state.focusSession;

                        // CASE 1: Stage Mode (Capture Screenshot)
                        if (session.isActive && session.isStageMode) {
                            try {
                                // Use the shared robust capture function
                                const dataUrl = await App.events.captureVisibleStage();

                                if (!dataUrl) {
                                    console.warn("Capture returned null. Opening blank whiteboard.");
                                    App.ui.showToast('Background capture unavailable. Opening blank board.', { type: 'info', duration: 2000 });
                                    const currentArticle = session.articles[session.currentIndex];
                                    const articleId = currentArticle?.id || null;
                                    App.whiteboard.open('end', articleId);
                                    return;
                                }

                                // Get current article ID Context
                                const currentArticle = session.articles[session.currentIndex];
                                const articleId = currentArticle?.id || null;

                                // Calculate dimensions (based on viewport, as that's what we captured)
                                const ratio = window.devicePixelRatio || 1;
                                const width = window.innerWidth * ratio;
                                const height = window.innerHeight * ratio;

                                // Open whiteboard with the screenshot
                                await App.whiteboard.openWithScreenshot(dataUrl, width, height, articleId, true);

                            } catch (err) {
                                console.error("Whiteboard capture failed:", err);
                                App.ui.showToast('Capture error. Opening blank board.', { type: 'warning' });
                                const currentArticle = session.articles[session.currentIndex];
                                const articleId = currentArticle?.id || null;
                                App.whiteboard.open('end', articleId);
                            }
                        }
                        // CASE 2: Normal Mode
                        else {
                            App.whiteboard.open('end');
                        }
                    },
                    toggle() {
                        App.annotationEngine.toggle('focus');
                    },
                    clear() {
                        App.annotationEngine.clearCurrentPage();
                    }
                },

                unmountViewListeners() {

                    const oldContentDiv = document.getElementById('article-content');
                    if (oldContentDiv) {
                        const newContentDiv = oldContentDiv.cloneNode(true);
                        oldContentDiv.parentNode.replaceChild(newContentDiv, oldContentDiv);
                    }


                    const mainEl = document.querySelector('main');
                    if (mainEl) {
                        mainEl.removeEventListener('scroll', App.events.updateReadingProgress);
                    }

                    const controls = document.getElementById('article-controls');
                    if (controls && controls.parentElement !== document.body) {
                        document.body.appendChild(controls);
                    }

                    if (App.state.autosaveInterval) {
                        clearInterval(App.state.autosaveInterval);
                        App.state.autosaveInterval = null;
                        App.state.isArticleDirty = false;
                    }
                    if (App.state.guardianObserver) {
                        App.state.guardianObserver.disconnect();
                        App.state.guardianObserver = null;
                    }


                    if (App.whiteboard?.state?.animationFrameId) {
                        cancelAnimationFrame(App.whiteboard.state.animationFrameId);
                        App.whiteboard.state.animationFrameId = null;
                    }
                    if (App.visualMap && App.visualMap.destroy) App.visualMap.destroy();
                    if (App.mindMap && App.mindMap.destroy) App.mindMap.destroy();
                },

                async installPwa() {
                    const promptEvent = App.state.pwa.installPromptEvent;
                    if (!promptEvent) return;

                    promptEvent.prompt();
                    const { outcome } = await promptEvent.userChoice;

                    App.state.pwa.installPromptEvent = null;
                    const installBtn = document.getElementById('install-pwa-btn');
                    if (installBtn) {
                        installBtn.style.display = 'none';
                    }
                },

                toggleCategoryNameStyle() {
                    const currentStyle = App.settings.get('categoryNameStyle') || 'full';
                    const newStyle = currentStyle === 'full' ? 'short' : 'full';
                    App.settings.set('categoryNameStyle', newStyle);
                    const activeView = App.router?.getActiveView ? App.router.getActiveView() : 'library';
                    if (activeView === 'category') {
                        const catView = document.getElementById('category-view');
                        const activeData = App.router.getActiveViewData() || 'All';
                        if (catView) App.ui.renderCategoryView(catView, activeData);
                    } else if (activeView === 'flashcard') {
                        const fcView = document.getElementById('flashcard-view');
                        if (fcView) App.ui.renderFlashcardView(fcView);
                    } else {
                        App.router.navigateTo('library');
                    }
                },

                handleGlobalKeyDown(e) {
                    if (e.key === 'Escape' && App.commandPalette.state.isPreviewActive) {
                        e.preventDefault();
                        e.stopPropagation();
                        App.commandPalette.close(); // This triggers our robust _restoreEditor logic
                        return;
                    }

                    // --- ROBUST VIDEO DELETION (Simplified & Strong) ---
                    if ((e.key === 'Backspace' || e.key === 'Delete') && App.router.getActiveView() === 'article' && App.state.mode === 'write') {
                        const selection = window.getSelection();
                        if (selection.rangeCount > 0) {
                            const range = selection.getRangeAt(0);

                            // 1. If selection is NOT collapsed (user selected the video or text around it)
                            if (!range.collapsed) {
                                let node = range.commonAncestorContainer;
                                if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;

                                const embeddedVideo = node.querySelector ? node.querySelector('.nk-video-embed') : null;
                                const closestVideo = node.closest('.nk-video-embed');

                                if (closestVideo) {
                                    e.preventDefault();
                                    closestVideo.remove();
                                    App.state.isArticleDirty = true;
                                    App.ui.showToast('Video removed', { type: 'info' });
                                    return;
                                }
                                if (embeddedVideo && range.intersectsNode(embeddedVideo)) {
                                    embeddedVideo.remove();
                                    App.state.isArticleDirty = true;
                                }
                            }

                            // 2. Cursor is collapsed (Caret)
                            else {
                                let targetVideo = null;

                                if (e.key === 'Backspace') {
                                    const isAtStart = (range.startContainer.nodeType === Node.TEXT_NODE && range.startOffset === 0) ||
                                        (range.startContainer.nodeType === Node.ELEMENT_NODE && range.startOffset === 0);

                                    if (isAtStart) {
                                        // Current block's previous sibling
                                        let block = range.startContainer;
                                        while (block && block.style && block.style.display === 'inline') block = block.parentElement; // Walk up inline elements
                                        if (block.nodeType === Node.TEXT_NODE) block = block.parentElement;

                                        if (block.previousElementSibling && block.previousElementSibling.classList.contains('nk-video-embed')) {
                                            targetVideo = block.previousElementSibling;
                                        }
                                    } else {
                                        // Might be right after the video in the SAME container? (Unlikely for block video)
                                        // Check immediate child before cursor if in Element
                                        if (range.startContainer.nodeType === Node.ELEMENT_NODE) {
                                            const childBefore = range.startContainer.childNodes[range.startOffset - 1];
                                            if (childBefore && childBefore.classList && childBefore.classList.contains('nk-video-embed')) {
                                                targetVideo = childBefore;
                                            }
                                        }
                                    }
                                }
                                else if (e.key === 'Delete') {
                                    // Look Forwards (Fn+Backspace)
                                    let block = range.startContainer;
                                    if (block.nodeType === Node.TEXT_NODE) block = block.parentElement;

                                    if (block.nextElementSibling && block.nextElementSibling.classList.contains('nk-video-embed')) {
                                        const isAtEnd = (range.startContainer.nodeType === Node.TEXT_NODE && range.startOffset === range.startContainer.length) ||
                                            (range.startContainer.nodeType === Node.ELEMENT_NODE && range.startOffset === range.startContainer.childNodes.length);

                                        if (isAtEnd && block.nextElementSibling.classList.contains('nk-video-embed')) {
                                            targetVideo = block.nextElementSibling;
                                        }
                                    }
                                }

                                if (targetVideo) {
                                    e.preventDefault();
                                    targetVideo.remove();
                                    App.state.isArticleDirty = true;
                                    App.ui.showToast('Video removed', { type: 'info' });
                                    return;
                                }
                            }
                        }
                    }

                    const cmdKey = App.util.getCommandKey() === 'Cmd' ? e.metaKey : e.ctrlKey;
                    const isModalOpen = document.getElementById('modal-container').hasChildNodes();
                    const target = e.target;
                    const isEditable = target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
                    const activeViewId = App.router.getActiveView();


                    if (e.key.toLowerCase() === 'h' && activeViewId === 'category' && !isEditable) {
                        e.preventDefault();
                        App.events.toggleCategoryHighlights();
                        return;
                    }
                    if (e.key === 'Enter' && !isEditable) {
                        const welcomeView = document.getElementById('welcome-view');
                        if (welcomeView && welcomeView.classList.contains('active')) {
                            e.preventDefault();
                            const resumeBtn = document.getElementById('resume-btn');
                            if (resumeBtn) resumeBtn.click();
                            else document.getElementById('select-folder-btn')?.click();
                        }
                    }

                    if (e.key === 'Escape') {
                        if (document.body.classList.contains('canvas-focus-mode')) {
                            App.events.toggleCanvasFocusMode();
                            e.preventDefault();
                            return;
                        }

                        if (isModalOpen) App.ui.closeModal();
                        else if (App.state.isFullscreen) App.events.toggleFocusMode();
                        else if (App.state.studySession.isActive) App.events.study.exit();
                        else if (activeViewId && activeViewId !== 'library') App.router.navigateTo('library');
                    }
                    if (e.altKey && e.key.toLowerCase() === 'a') {
                        e.preventDefault();
                        const aiToggle = document.getElementById('ai-magic-toggle');
                        if (aiToggle && aiToggle.style.display !== 'none') {
                            const ctx = document.body.classList.contains('pdf-viewer-active') ? 'pdf' : document.body.classList.contains('focus-mode-active') ? 'presentation' : (activeViewId || 'general');
                            App.ui.aiMagicModal.openAsViewer(ctx);
                        } else if (activeViewId === 'library' || activeViewId === 'article') {
                            App.ui.aiMagicModal.open();
                        }
                        return;
                    }
                    // ... (The rest of the function remains identical) ...
                    if (cmdKey && e.key.toLowerCase() === 'k') { e.preventDefault(); App.globalSearch.openSearch(); }
                    if (e.altKey && e.shiftKey && e.key.toLowerCase() === 'n') { e.preventDefault(); if (!document.getElementById('new-article-btn').disabled) App.events.createNewArticle(); }
                    if (cmdKey && e.key.toLowerCase() === 's') { if (App.state.currentMode === 'write') { e.preventDefault(); App.events.saveArticle(false); } }
                    if (e.altKey && e.key.toLowerCase() === 'o' && !cmdKey && !e.shiftKey) { const isWelcomeActive = document.getElementById('welcome-view')?.classList.contains('active'); const isLibraryActive = document.getElementById('library-view')?.classList.contains('active'); if (isWelcomeActive || isLibraryActive) { e.preventDefault(); App.events.selectDirectory(true); } }
                    if (e.key.toLowerCase() === 's' && !cmdKey && !e.altKey && !e.shiftKey && !isEditable) {
                        const isLibraryActive = document.getElementById('library-view')?.classList.contains('active');
                        const isFlashcardActive = document.getElementById('flashcard-view')?.classList.contains('active');
                        if (isLibraryActive) { e.preventDefault(); document.getElementById('search-input')?.focus(); document.getElementById('search-input')?.select(); }
                        else if (isFlashcardActive) { e.preventDefault(); document.getElementById('flashcard-search-input')?.focus(); document.getElementById('flashcard-search-input')?.select(); }
                    }
                    if (App.state.currentMode === 'read' && document.getElementById('article-view')?.classList.contains('active') && !document.body.classList.contains('pdf-viewer-active')) {
                        if (e.key.toLowerCase() === 'f' && !cmdKey && !e.altKey && !e.shiftKey && !isEditable) {
                            e.preventDefault();
                            App.events.toggleFocusMode();
                        }
                        if (e.key.toLowerCase() === 'c' && !cmdKey && !e.altKey && !e.shiftKey && !isEditable) {
                            e.preventDefault();
                            App.events.cycleReaderTheme();
                        }
                        if (e.key.toLowerCase() === 'e' && !cmdKey && !e.altKey && !e.shiftKey && !isEditable) {
                            e.preventDefault();
                            App.events.switchToMode('write');
                        }
                        if (e.key.toLowerCase() === 's' && !cmdKey && !e.altKey && !e.shiftKey && !isEditable) {
                            e.preventDefault();
                            const now = new Date().getTime();
                            if (now - App.state.lastHeartKeyPressTime < 400) { // Double-press detected
                                App.events.resetReadCount();
                                App.state.lastHeartKeyPressTime = 0; // Reset timer to prevent triple-press issues
                            } else { // Single-press
                                App.events.finishArticle();
                                App.state.lastHeartKeyPressTime = now;
                            }
                        }

                        // NEW: Laser Toggle (L) in Read Mode
                        if (e.key.toLowerCase() === 'l' && !isEditable && !isModalOpen && !cmdKey && !e.shiftKey) {
                            e.preventDefault();
                            App.events.toggleSharedLaser('read');
                            return;
                        }
                    }
                    if (App.state.studySession.isActive) App.events.study.handleKeyboard(e);
                },

                async selectDirectory(isChange = false) {
                    if ('showDirectoryPicker' in window) {
                        try {
                            const handle = await window.showDirectoryPicker();
                            const hasPermission = await App.storage.verifyPermission(handle);

                            if (hasPermission) {
                                const migrationResult = await App.services.migration.browserToFolder(handle);

                                if (migrationResult === 'error' || migrationResult === 'cancelled') {
                                    return;
                                }


                                this.transitionToLibrary(async () => {
                                    App.state.isInitialLoadComplete = false;
                                    App.state.isHydrated = false;
                                    App.state.articles = [];

                                    await App.settings.set('lastStorageMode', 'fileSystem');
                                    App.state.directoryHandle = handle;
                                    await App.indexedDB.setHandle('directory', handle);
                                    await App.util.requestDurableStorage();
                                    App.state.storageMode = 'fileSystem';

                                    await App.settings.load();
                                    App.ui.applyTheme(App.settings.get('theme'));

                                    await App.loadInitialData();
                                    App.router.navigateTo('library');

                                    App.ui.showToast(`Switched to Folder Mode: '${handle.name}' selected.`, { type: 'success' });
                                });
                            } else {
                                throw new Error("Permission was denied after selection.");
                            }
                        } catch (err) {
                            if (err.name !== 'AbortError') {
                                App.ui.showToast('Could not access the selected directory.', { type: 'error' });
                            }
                        }
                    } else {
                        App.ui.showToast('Select your note files to import.', 'info');
                        document.getElementById('mobile-import-input').click();
                    }
                },

                async requestStoredPermission() {
                    if (!App.state.directoryHandle) {
                        App.ui.showToast("No folder handle found. Please select a new folder.", { type: 'error' });
                        App.router.navigateTo('welcome', { permissionState: 'none' });
                        return;
                    }
                    try {
                        const permission = await App.state.directoryHandle.requestPermission({ mode: 'readwrite' });
                        if (permission === 'granted') {
                            window.location.reload();
                        } else {
                            App.ui.showToast("Permission was denied. Please select the folder again.", { type: 'error' });
                            App.router.navigateTo('welcome', { permissionState: 'denied' });
                        }
                    } catch (err) {
                        if (err.name !== 'AbortError') {
                            console.error("Error requesting permission:", err);
                            App.ui.showToast("Could not get permission for the folder.", { type: 'error' });
                        }
                    }
                },
                async createNewArticle() {
                    if (!App.license.isPremium() && App.state.articles.length >= App.config.sparkTierLimit) {
                        App.ui.showAscensionModal('limit');
                        App.ui.showToast('Note limit reached. Go Premium for unlimited notes.', 'warning');
                        return;
                    }
                    // Create a temporary, in-memory article object without saving a file.
                    const tempArticle = {
                        id: 'temp_new_article', // A special, temporary ID
                        title: 'Untitled Article',
                        content: '<p><br></p>',
                        category: (App.settings.get('userCategories').find(c => c.isDefault) || { name: 'General' }).name,
                        readCount: 0,
                        readHistory: [],
                        tags: [],
                        flashcards: {},
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    // Navigate to the editor, passing the temporary object directly.
                    App.router.navigateTo('article', { articleObject: tempArticle, mode: 'write' });
                },
                switchToMode(mode) {
                    if (mode === 'write') {
                        const article = App.storage.getArticle(App.state.activeArticleId);
                        if (article && article.isReadOnly) {
                            return App.ui.showToast('Creator has disabled editing for this note', { type: 'warning' });
                        }
                    }
                    App.router.navigateTo('article', { id: App.state.activeArticleId, mode });
                },

                toggleCanvasFocusMode() {
                    document.body.classList.toggle('canvas-focus-mode');
                    // Give the browser a moment to apply CSS changes before resizing
                    setTimeout(() => {
                        const activeViewId = App.router.getActiveView();
                        if (activeViewId === 'visual-map' && App.visualMap.triggerResize) {
                            App.visualMap.triggerResize();
                        } else if (activeViewId === 'mindmap' && App.mindMap.triggerResize) {
                            App.mindMap.triggerResize();
                        }
                    }, 100);
                },

                async saveArticle(options = {}) {
                    // MUTEX LOCK: If another save is actively executing, await its completion before proceeding.
                    if (App.state._savePromise) {
                        try {
                            await App.state._savePromise;
                        } catch (e) {
                            console.warn("Previous save operation encountered an error:", e);
                        }
                        // If we are not forcing a save or switching mode, and the article is no longer dirty, exit safely.
                        if (!options.force && !options.switchToRead && !App.state.isArticleDirty) {
                            return;
                        }
                    }

                    let resolveMutex;
                    App.state._savePromise = new Promise(resolve => { resolveMutex = resolve; });
                    App.state.isSaving = true;

                    // --- OPTIMIZATION: Hash-based "Virtual Save" ---
                    const { content: newContent, switchToRead = false, isAutosave = false, force = false } = options;

                    let savingToast = null;
                    if (switchToRead) {
                        savingToast = App.ui.showToast("Saving...", { type: 'info', duration: 0 });
                        await new Promise(resolve => setTimeout(resolve, 30));
                    }

                    try {
                        const id = App.state.activeArticleId;
                        if (!id) {
                            return;
                        }

                        const articleInMemory = App.storage.getArticle(id) || {};
                        const isWriteMode = App.state.currentMode === 'write';
                        const titleInput = document.getElementById('article-title');
                        const contentDiv = document.getElementById('article-content');
                        if (!titleInput && !articleInMemory.title) {
                            if (!isAutosave) App.ui.showToast("Save failed. Editor not found.", { type: 'error' });
                            return;
                        }
                        if (isWriteMode && App.util.hasRenderedMath(contentDiv)) {
                            // Auto-heal: convert any rendered KaTeX back to clean LaTeX source ($...$ / $$...$$)
                            App.util.unrenderKaTeXToSource(contentDiv);
                        }
                        if (isWriteMode && App.util.hasRenderedMath(contentDiv)) {
                            if (!isAutosave) App.ui.showToast("Save blocked to protect note source. Reopen the note and try again.", { type: 'error' });
                            console.warn('Save blocked: rendered KaTeX markup was found in write-mode content.');
                            return;
                        }

                        const title = (isWriteMode && titleInput)
                            ? titleInput.value.trim()
                            : (articleInMemory.title || '').trim();

                        // --- FIX: Handle Fullscreen Maps before getting content ---
                        const fullscreenMaps = Array.from(document.querySelectorAll('.nk-map-embed.is-viewport-fullscreen'));
                        const restoredMaps = [];

                        if (!newContent && isWriteMode && contentDiv) {
                            fullscreenMaps.forEach(map => {
                                const placeholderId = map.dataset.placeholderId;
                                if (placeholderId) {
                                    const placeholder = document.getElementById(placeholderId);
                                    // Ensure placeholder is within the content we are saving
                                    if (placeholder && contentDiv.contains(placeholder)) {
                                        placeholder.replaceWith(map);
                                        restoredMaps.push({ map, placeholder });
                                    }
                                }
                            });
                        }

                        let content = '';
                        if (newContent !== undefined) {
                            content = newContent;
                        } else if (isWriteMode && contentDiv) {
                            App.util.removeAllMcqCapsules(contentDiv);
                            content = contentDiv.innerHTML.trim();
                        } else {
                            // In read/focus/pdf contexts, never persist display-rendered HTML as source content.
                            content = articleInMemory.content || '';
                        }

                        // Recovery + safety: convert any rendered cloze spans back to canonical tokens.
                        content = App.util.normalizeRenderedClozeToTokens(content);

                        // --- Restore Fullscreen Maps state (so user doesn't see them disappear) ---
                        restoredMaps.forEach(({ map, placeholder }) => {
                            map.replaceWith(placeholder);
                            document.body.appendChild(map);
                        });


                        // Prepare content for saving (normalization)
                        content = App.util.parseShortcuts(content);
                        content = App.contentTools.updateDataTagsInContent(content);

                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = content;
                        App.util.cleanPlyrForSave(tempDiv);

                        tempDiv.querySelectorAll('.nk-map-embed.is-viewport-fullscreen').forEach(map => {
                            map.classList.remove('is-viewport-fullscreen');
                            map.style.zIndex = '';
                            delete map.dataset.placeholderId;
                        });
                        tempDiv.querySelectorAll('.nk-map-placeholder').forEach(ph => ph.remove());

                        // Get in-memory attachments to include in hash calculation
                        let attachments = articleInMemory.attachments || [];

                        // --- Fix: Hoist Category Logic so it's included in Hash ---
                        const defaultCategoryName = (App.settings.get('userCategories').find(c => c.isDefault) || { name: 'General' }).name;
                        let category = document.getElementById('category-selector')?.value;
                        if (!category && id !== 'temp_new_article') {
                            const existingArticle = App.storage.getArticle(id);
                            if (existingArticle) category = existingArticle.category;
                        }
                        category = category || defaultCategoryName;

                        // --- HASH CHECK ---
                        // Simple DJB2 hash for string content
                        const hashString = (str) => {
                            let hash = 5381;
                            for (let i = 0; i < str.length; i++) {
                                hash = ((hash << 5) + hash) + str.charCodeAt(i); /* hash * 33 + c */
                            }
                            return hash.toString();
                        };

                        // Include category in the hash!
                        const currentDataString = title + content + category + JSON.stringify(attachments);
                        const currentHash = hashString(currentDataString);

                        if (!force && !switchToRead && App.state.lastSavedHash === currentHash) {
                            if (!isAutosave) {
                                App.ui.showToast("No changes to save.", { type: 'info' });
                            } else {
                            }
                            return;
                        }

                        // Proceed with full save logic...

                        let attachmentsUpdated = false;

                        tempDiv.querySelectorAll('.pdf-attachment-pill[data-pdf-id]').forEach(pill => {
                            const attachmentId = pill.dataset.pdfId;
                            const nameSpan = pill.querySelector('.pdf-attachment-name');
                            const newName = nameSpan ? nameSpan.textContent.trim() : '';

                            const attachmentIndex = attachments.findIndex(att => att.id === attachmentId);

                            if (attachmentIndex > -1 && newName) {
                                const originalName = attachments[attachmentIndex].name;
                                const extension = originalName.slice(originalName.lastIndexOf('.'));
                                const newFullName = `${newName}${extension}`;

                                if (originalName !== newFullName) {
                                    attachments[attachmentIndex].name = newFullName;
                                    attachmentsUpdated = true;
                                }
                            }
                        });

                        const seenIds = new Set();
                        const snippetSelector = '[class*="highlight-"], [class*="text-"]';
                        tempDiv.querySelectorAll(snippetSelector).forEach(el => {
                            if (!el.id || seenIds.has(el.id)) {
                                el.id = `snip-${crypto.randomUUID().slice(0, 12)}`;
                            }
                            seenIds.add(el.id);
                        });
                        tempDiv.querySelectorAll('.rendered-tag').forEach(el => {
                            if (!el.id || seenIds.has(el.id)) {
                                el.id = `tag-snip-${crypto.randomUUID().slice(0, 12)}`;
                            }
                            seenIds.add(el.id);
                        });

                        content = tempDiv.innerHTML; // Re-read content after ID updates

                        const isContentEmpty = content === '' || content === '<p><br></p>' || contentDiv.textContent.trim() === '';
                        if (!title && isContentEmpty) {
                            if (!isAutosave) { App.ui.showToast("Cannot save an empty article.", { type: 'warning' }); }
                            return;
                        }

                        const handleSaveSuccess = async (savedArticle) => {
                            App.state.isArticleDirty = false;
                            App.state.lastSavedHash = currentHash; // UPDATE HASH
                            App.state.searchIndexDirty = true; // Invalidate Search Cache

                            App.commandPalette.state.fuse.links = null;
                            if (window.requestIdleCallback) {
                                requestIdleCallback(async () => {
                                    await App.contentTools.updateTagsIndex();
                                    requestIdleCallback(() => App.contentTools.buildDataCache(savedArticle.id), { timeout: 5000 });
                                }, { timeout: 5000 });
                            } else {
                                // Safari fallback: defer with macro-task gap so current frame can paint first
                                setTimeout(async () => {
                                    await App.contentTools.updateTagsIndex();
                                    setTimeout(() => App.contentTools.buildDataCache(savedArticle.id), 50);
                                }, 200);
                            }

                            App.ui.updateArticleMetadata(content, savedArticle.createdAt);
                            if (switchToRead) {
                                await App.contentTools.updateTagsIndex();
                                App.contentTools.buildDataCache(savedArticle.id);
                                this.switchToMode('read');
                                if (savingToast) App.ui.hideToast(savingToast);
                                if (!isAutosave) App.ui.showToast('Saved!', { type: 'success' });
                            } else if (!isAutosave) {
                                App.ui.showToast('Saved!', { type: 'success' });
                            }
                            if (App.dropbox.isReady() && App.settings.get('enableDropboxSync')) {
                                App.dropbox.syncChanges(true, savedArticle.id);
                            }
                        };

                        if (id === 'temp_new_article') {
                            const articleData = { title, content, category, attachments };
                            const newArticle = await App.storage.createArticle(articleData);
                            if (newArticle) {
                                App.state.activeArticleId = newArticle.id;
                                await handleSaveSuccess(newArticle);
                            } else if (!isAutosave) {
                                App.ui.showToast("Failed to save new article", { type: 'error' });
                            }
                        } else {
                            const article = App.storage.getArticle(id) || {};
                            const existingFlashcards = article.flashcards || {};
                            const newFlashcards = App.util.extractFlashcards(content, id, category, existingFlashcards);
                            const newTags = App.contentTools.extractTagsFromHTML(content);

                            const updates = { title, content, category, flashcards: newFlashcards, tags: newTags, attachments: attachments };

                            const result = await App.storage.updateArticle(id, updates);
                            if (result && result.success) {
                                await handleSaveSuccess(result.article);
                            } else if (!isAutosave) {
                                App.ui.showToast("Failed to save article", { type: 'error' });
                            }
                        }
                    } catch (err) {
                        console.error("saveArticle error:", err);
                        if (!isAutosave) App.ui.showToast("An unexpected error occurred while saving.", { type: 'error' });
                    } finally {
                        App.state.isSaving = false;
                        App.state._savePromise = null;
                        if (resolveMutex) resolveMutex();
                        if (savingToast) App.ui.hideToast(savingToast);
                    }
                },

                async finishArticle() {
                    const id = App.state.activeArticleId;
                    if (!id) return;

                    const articleIndex = App.state.articles.findIndex(a => a.id === id);
                    if (articleIndex === -1) return;
                    const article = App.state.articles[articleIndex];
                    const newCount = (article.readCount || 0) + 1;
                    const newHistory = [...(article.readHistory || []), new Date().toISOString()];
                    const updatedArticle = { ...article, readCount: newCount, readHistory: newHistory };
                    App.state.articles[articleIndex] = updatedArticle;
                    App.ui.renderArticleControls(updatedArticle);
                    setTimeout(() => {
                        const heartButton = document.querySelector('.read-mode-controls [data-action="finishArticle"]');
                        if (heartButton) {
                            heartButton.classList.add('done-btn-animated');
                            heartButton.addEventListener('animationend', () => {
                                heartButton.classList.remove('done-btn-animated');
                            }, { once: true });
                        }
                    }, 50);
await App.storage.updateArticle(id, { readCount: newCount, readHistory: newHistory });
                },

                async resetReadCount() {
                    await App.storage.updateArticle(App.state.activeArticleId, { readCount: 0, readHistory: [] });
                    App.ui.showToast("Article progress reset.");
                    App.ui.renderArticleControls(App.storage.getArticle(App.state.activeArticleId));
                },

                _isPrintPrepared: false,

                preparePrintDocument() {
                    if (this._isPrintPrepared) return;
                    this._isPrintPrepared = true;

                    const article = App.storage ? App.storage.getArticle(App.state?.activeArticleId) : null;
                    const articleContainer = document.querySelector('.article-container');
                    const contentEl = document.getElementById('article-content');
                    
                    const articleTitle = article?.title || document.getElementById('article-title')?.value || document.title || 'NoteKash Note';
                    const isPremium = typeof App.license?.isPremium === 'function' ? App.license.isPremium() : false;
                    const brandName = App.settings?.get ? App.settings.get('brandName') : '';
                    const brandLink = App.settings?.get ? App.settings.get('brandLink') : '';
                    
                    // Render LaTeX / MathJax equations safely if available
                    if (contentEl && typeof App.util?.renderMathInElement === 'function') {
                        try {
                            App.util.renderMathInElement(contentEl);
                        } catch (e) {
                            console.warn('KaTeX print render skipped:', e);
                        }
                    }

                    // Inject Top & Bottom Branding Tiles, Promotional Cards (Free Users), and Notes Pages
                    if (articleContainer && !articleContainer.querySelector('.nk-print-branding-tile-top')) {
                        const brandLeftHtml = (isPremium && brandName)
                            ? `<span class="nk-tile-label">Made by:</span> <a href="${brandLink ? App.util.escapeHtml(brandLink) : '#'}" class="nk-tile-brand" target="_blank" rel="noopener noreferrer">${App.util.escapeHtml(brandName)}</a>`
                            : `<span class="nk-tile-label">Edition:</span> <a href="https://civilskash.in" class="nk-tile-brand" target="_blank" rel="noopener noreferrer">Civilskash</a>`;

                        const brandTileHtml = (isTop = true) => `
                            <div class="nk-print-branding-tile ${isTop ? 'nk-print-branding-tile-top' : 'nk-print-branding-tile-bottom'}">
                                <div class="nk-print-tile-left">
                                    ${brandLeftHtml}
                                </div>
                                <div class="nk-print-tile-right">
                                    <span class="nk-tile-label">Made on:</span>
                                    <a href="https://notekash.com" target="_blank" rel="noopener noreferrer" class="nk-tile-link">
                                        <span class="nk-tile-brand-name">notekash</span><span class="nk-tile-brand-tld">.com</span>
                                    </a>
                                </div>
                            </div>
                        `;

                        const promoCardHtml = (isEnd = false) => `
                            <div class="nk-print-promo-card ${isEnd ? 'nk-print-promo-card-end' : 'nk-print-promo-card-start'}">
                                <div class="nk-promo-header">
                                    <div class="nk-promo-brand">
                                        <span class="nk-promo-brand-dark">NOTE</span><span class="nk-promo-brand-accent"> KASH</span>
                                    </div>
                                    <a href="https://civilskash.in" target="_blank" rel="noopener noreferrer" class="nk-promo-edition">CIVILSKASH EDITION</a>
                                </div>
                                <div class="nk-promo-divider"></div>
                                <div class="nk-promo-columns">
                                    <div class="nk-promo-col">
                                        <div class="nk-promo-col-title nk-title-users">FOR NEW USERS</div>
                                        <div class="nk-promo-feature">Flashcards &nbsp;·&nbsp; Focus Study Mode</div>
                                        <div class="nk-promo-feature">Mind map &nbsp;·&nbsp; Visual map (special)</div>
                                        <div class="nk-promo-feature">AI NoteTaking &nbsp;·&nbsp; Super Search</div>
                                        <div class="nk-promo-feature">Spatial Notes &nbsp;·&nbsp; Whiteboard</div>
                                        <div class="nk-promo-feature">Focus Hub App &nbsp;·&nbsp; Daily Habit Tracker</div>
                                        <div class="nk-promo-faint">Unlock your Second Brain only on NoteKash.</div>
                                    </div>
                                    <div class="nk-promo-col">
                                        <div class="nk-promo-col-title nk-title-creators">FOR CREATORS</div>
                                        <div class="nk-promo-feature">Remove watermark & add Branding</div>
                                        <div class="nk-promo-feature">Unlimited AI + Presentation Tools</div>
                                        <div class="nk-promo-feature">Share Project or Export notes</div>
                                        <div class="nk-promo-feature">MCQs, Accordian & Audio Transcribe</div>
                                        <div class="nk-promo-feature">Focus Hub App &nbsp;·&nbsp; Creator Studio</div>
                                        <div class="nk-promo-faint">Upgrade to Creator tier to start curating Pro Content.</div>
                                    </div>
                                </div>
                                <div class="nk-promo-pills-grid">
                                    <a href="https://notekash.com" target="_blank" rel="noopener noreferrer" class="nk-promo-pill nk-pill-visual">VISUAL MAP</a>
                                    <a href="https://notekash.com" target="_blank" rel="noopener noreferrer" class="nk-promo-pill nk-pill-mindmap">MIND MAP</a>
                                    <a href="https://notekash.com" target="_blank" rel="noopener noreferrer" class="nk-promo-pill nk-pill-flashcards">FLASHCARDS</a>
                                    <a href="https://notekash.com" target="_blank" rel="noopener noreferrer" class="nk-promo-pill nk-pill-focushub">FOCUS HUB</a>
                                    <a href="https://notekash.com" target="_blank" rel="noopener noreferrer" class="nk-promo-pill nk-pill-ai">NoteKash AI</a>
                                    <a href="https://notekash.com" target="_blank" rel="noopener noreferrer" class="nk-promo-pill nk-pill-supertags">SUPER TAGS</a>
                                    <a href="https://notekash.com" target="_blank" rel="noopener noreferrer" class="nk-promo-pill nk-pill-whiteboard">WHITEBOARD</a>
                                    <a href="https://notekash.com" target="_blank" rel="noopener noreferrer" class="nk-promo-pill nk-pill-cloudsync">CLOUD SYNC</a>
                                </div>
                                <div class="nk-promo-divider"></div>
                                <div class="nk-promo-footer">
                                    Get started free at <a href="https://notekash.com" class="nk-promo-cta-link" target="_blank" rel="noopener noreferrer">notekash.com</a>
                                </div>
                            </div>
                        `;

                        const notesPagesHtml = `
                            <div class="nk-print-notes-pages">
                                <div class="nk-print-notes-page">
                                    <div class="nk-print-notes-header">
                                        <span class="nk-print-notes-title">Notes:</span>
                                    </div>
                                </div>
                                <div class="nk-print-notes-page">
                                    <div class="nk-print-notes-header">
                                        <span class="nk-print-notes-title">Notes:</span>
                                    </div>
                                </div>
                                <div class="nk-print-notes-page">
                                    <div class="nk-print-notes-header">
                                        <span class="nk-print-notes-title">Notes:</span>
                                    </div>
                                </div>
                            </div>
                        `;

                        // Free Users: Insert Top Promotional Tile at the very beginning
                        if (!isPremium) {
                            const promoStartWrapper = document.createElement('div');
                            promoStartWrapper.innerHTML = promoCardHtml(false);
                            if (contentEl) {
                                articleContainer.insertBefore(promoStartWrapper.firstElementChild, contentEl);
                            } else {
                                articleContainer.appendChild(promoStartWrapper.firstElementChild);
                            }
                        }

                        // Insert Top Tile before article-content
                        const topTileWrapper = document.createElement('div');
                        topTileWrapper.innerHTML = brandTileHtml(true);
                        if (contentEl) {
                            articleContainer.insertBefore(topTileWrapper.firstElementChild, contentEl);
                        } else {
                            articleContainer.appendChild(topTileWrapper.firstElementChild);
                        }

                        // Insert Bottom Tile immediately after article-content
                        const bottomTileWrapper = document.createElement('div');
                        bottomTileWrapper.innerHTML = brandTileHtml(false);
                        articleContainer.appendChild(bottomTileWrapper.firstElementChild);

                        // Free Users: Insert Bottom Promotional Tile at the end
                        if (!isPremium) {
                            const promoEndWrapper = document.createElement('div');
                            promoEndWrapper.innerHTML = promoCardHtml(true);
                            articleContainer.appendChild(promoEndWrapper.firstElementChild);
                        }

                        // Insert 3 Blank Notes Pages at end of document
                        const notesWrapper = document.createElement('div');
                        notesWrapper.innerHTML = notesPagesHtml;
                        articleContainer.appendChild(notesWrapper.firstElementChild);
                    }

                    // Inject repeating minimal running footer on each printed page
                    let footerEl = document.getElementById('nk-print-page-footer');
                    if (!footerEl) {
                        footerEl = document.createElement('div');
                        footerEl.id = 'nk-print-page-footer';
                        footerEl.className = 'nk-print-page-footer';
                        document.body.appendChild(footerEl);
                    }
                    const brandDisplayHtml = (isPremium && brandName)
                        ? `<span class="nk-print-footer-brand">${App.util.escapeHtml(brandName)}</span>`
                        : `<a href="https://civilskash.in" class="nk-print-footer-brand" target="_blank" rel="noopener noreferrer">Civilskash</a>`;

                    footerEl.innerHTML = `
                        <div class="nk-print-footer-left">
                            ${brandDisplayHtml}
                        </div>
                        <div class="nk-print-footer-right">
                            <a href="https://notekash.com" class="nk-print-footer-notekash" target="_blank" rel="noopener noreferrer">notekash<span class="nk-print-footer-tld">.com</span></a>
                        </div>
                    `;

                    // Close any open popovers before printing
                    document.querySelectorAll('.popover-active').forEach(el => el.classList.remove('popover-active'));
                },

                cleanupPrintDocument() {
                    this._isPrintPrepared = false;
                    document.querySelectorAll('.nk-print-promo-card, .nk-print-branding-tile, .nk-print-notes-pages, .nk-print-page-footer, #nk-print-page-footer').forEach(el => el.remove());
                    if (App.state.currentMode === 'write') {
                        const contentEl = document.getElementById('article-content');
                        if (contentEl) App.util.unrenderKaTeXToSource(contentEl);
                    }
                },

                printDocument() {
                    this.preparePrintDocument();
                    window.print();
                },

                deleteArticleWithConfirmation() {
                    const id = App.state.activeArticleId;
                    if (!id) return;
                    const article = App.storage.getArticle(id);
                    const title = article?.title || 'this article';
                    App.ui.showConfirmationModal({
                        title: 'Delete Article',
                        message: `Are you sure you want to delete "${title}"? This will be deleted from your folder and synced.`,
                        confirmText: 'Delete',
                        onConfirm: async () => {
                            await App.storage.deleteArticle(id);
                            App.ui.showToast('Article deleted.');

                            App.commandPalette.state.fuse.links = null;

                            App.router.navigateTo('library');
                            if (App.dropbox.isReady() && App.settings.get('enableDropboxSync')) {
                                App.dropbox.syncChanges(true);
                            }
                        }
                    });
                },

                handleWriteModeImageUpload(event) {
                    const file = event.target.files[0];
                    if (file) {
                        if (file.type.startsWith('image/')) {
                            App.services.image.processAndInsert(file);
                        } else {
                            App.ui.showToast('Please select an image file.', { type: 'info' });
                        }
                    }
                    event.target.value = '';
                },

                insertAccordionCard() {
                    const cardId = 'acc_' + crypto.randomUUID();
                    const contentId = 'acc-content-' + cardId;
                    const cardHTML = `
                    <div class="nk-accordion" data-state="closed" data-id="${cardId}" data-reversible="false">
                        <div class="nk-accordion-trigger" role="button" tabindex="0" aria-expanded="false" aria-controls="${contentId}">
                            <span class="nk-accordion-title" contenteditable="true" data-placeholder="Question..."></span>
                            <div class="nk-accordion-controls">
                                <button class="nk-accordion-control-btn nk-accordion-hint-btn" title="Add/Edit Hint">${App.util.icons.hint}</button>
                                <button class="nk-accordion-control-btn nk-accordion-reversible-toggle" title="Make Reversible">${App.util.icons.reversible}</button>
                                <svg class="nk-accordion-chevron" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </div>
                        </div>
                        <div id="${contentId}" class="nk-accordion-content" contenteditable="true" data-placeholder="Answer..."><p><br></p></div>
                    </div>`;
                    App.util.insertGuardianBlock(cardHTML); // Use the helper
                },

                handleSearchCommand(e) {
                    if (e.key !== 'Enter') return;
                    const command = e.target.value.trim().toLowerCase();

                    let commandExecuted = false;

                    if (command.startsWith('!')) {
                        e.preventDefault();
                        const action = command.substring(1);
                        switch (action) {
                            case 'stats': App.router.navigateTo('stats-dashboard'); commandExecuted = true; break;
                            case 'quiz': App.quiz.start(); commandExecuted = true; break;
                        }
                    }
                    else if (command.startsWith('%')) {
                        e.preventDefault();
                        const action = command.substring(1);

                        if (action === '+' || action === 'new') { App.events.createNewArticle(); commandExecuted = true; }
                        else if (action === 'study') { App.events.study.start(); commandExecuted = true; }
                        else if (action === 'flash' || action === 'flashcards') { App.router.navigateTo('flashcard'); commandExecuted = true; }
                        else {
                            const foundCategory = App.settings.get('userCategories').find(c => c.toLowerCase() === action || App.util.getCategoryDisplayName(c).toLowerCase() === action);
                            if (foundCategory) { App.router.navigateTo('category', foundCategory); commandExecuted = true; }
                        }
                    }

                    if (commandExecuted) e.target.value = '';
                },

                async handlePaste(e) {
                    e.preventDefault();
                    const clipboardData = e.clipboardData || window.clipboardData;

                    const imageFile = Array.from(clipboardData.items).find(item => item.kind === 'file' && item.type.startsWith('image/'));
                    if (imageFile) {
                        App.services.image.processAndInsert(imageFile.getAsFile());
                        return;
                    }

                    const pastedHTML = clipboardData.getData('text/html');
                    const pastedText = clipboardData.getData('text/plain');

                    // ── FAST PATH: Native MCQKash/NoteKash MCQ HTML ───────────────────────
                    if (pastedHTML && pastedHTML.includes('nk-mcq-block')) {
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = App.util.sanitizeHTML(pastedHTML);
                        App.util.unrenderKaTeXToSource(tempDiv);
                        
                        // Reset interactive state from the source
                        tempDiv.querySelectorAll('.nk-mcq-block').forEach(block => {
                            block.removeAttribute('id');           // prevent ID collisions
                            block.removeAttribute('data-answered');
                            block.removeAttribute('data-user-incorrect');
                        });
                        tempDiv.querySelectorAll('.nk-mcq-option').forEach(opt => {
                            opt.classList.remove('correct', 'incorrect');
                        });
                        // Remove any meta bars that got copied accidentally
                        tempDiv.querySelectorAll('.nk-mcq-meta-bar').forEach(el => el.remove());
                        
                        // Clean style attributes only on non-MCQ elements
                        const nonMcqEls = tempDiv.querySelectorAll('*:not(.nk-mcq-block):not(.nk-mcq-block *)');
                        nonMcqEls.forEach(el => {
                            if (el.hasAttribute('style') && el.style) {
                                el.style.removeProperty('font-family');
                                el.style.removeProperty('font-size');
                                el.style.removeProperty('line-height');
                                el.style.removeProperty('background-color');
                                el.style.removeProperty('background');
                                el.style.removeProperty('color');
                            }
                        });
                        
                        document.execCommand('insertHTML', false, tempDiv.innerHTML);
                        App.state.isArticleDirty = true;
                        
                        // Re-parse metadata and re-render capsules
                        setTimeout(() => {
                            App.util.parseAllMcqMetadata();
                            if (App.state.currentMode === 'read') App.util.renderMcqCapsules();
                        }, 100);
                        
                        App.ui.showToast('MCQs pasted with full formatting preserved!', { type: 'success' });
                        return;
                    }

                    const PASTE_THRESHOLD = 50000;
                    const shouldShowProgress = (pastedText && pastedText.length > PASTE_THRESHOLD) || (pastedHTML && pastedHTML.length > PASTE_THRESHOLD);

                    if (shouldShowProgress) {
                        App.ui.migrationScreen.show("Pasting Content");
                        App.ui.migrationScreen.update(10, "Analyzing clipboard...");
                    }

                    setTimeout(() => {
                        try {

                            if (pastedHTML) {
                                if (shouldShowProgress) App.ui.migrationScreen.update(50, "Formatting rich text...");

                                const tempDiv = document.createElement('div');
                                tempDiv.innerHTML = App.util.sanitizeHTML(pastedHTML);
                                App.util.unrenderKaTeXToSource(tempDiv);
                                App.util.cleanPastedStyles(tempDiv);

                                tempDiv.querySelectorAll('.nk-accordion').forEach(accordion => {
                                    const newId = 'acc_' + crypto.randomUUID();
                                    const oldContentId = accordion.querySelector('.nk-accordion-trigger')?.getAttribute('aria-controls');
                                    const newContentId = 'acc-content-' + newId;
                                    accordion.dataset.id = newId;
                                    const trigger = accordion.querySelector('.nk-accordion-trigger');
                                    if (trigger) trigger.setAttribute('aria-controls', newContentId);
                                    const content = tempDiv.querySelector(`#${oldContentId}`);
                                    if (content) content.id = newContentId;
                                });

                                const finalHtml = tempDiv.innerHTML;
                                document.execCommand('insertHTML', false, finalHtml);

                                App.state.isArticleDirty = true;

                                if (shouldShowProgress) {
                                    App.ui.migrationScreen.update(100, "Done!");
                                    setTimeout(() => App.ui.migrationScreen.hide(), 200);
                                }
                                return;
                            }

                            if (pastedText) {
                                if (pastedText.length > PASTE_THRESHOLD) {
                                    this._insertLargeTextInChunks(pastedText);
                                } else {
                                    document.execCommand('insertHTML', false, App.util.textToHtml(pastedText));
                                    App.state.isArticleDirty = true;
                                    if (App.ui.migrationScreen) App.ui.migrationScreen.hide();
                                }
                                return;
                            }

                            if (App.ui.migrationScreen) App.ui.migrationScreen.hide();

                        } catch (err) {
                            console.error("Paste error:", err);
                            if (App.ui.migrationScreen) App.ui.migrationScreen.hide();
                            App.ui.showToast("Paste failed.", "error");
                        }
                    }, 50); // Slight delay to ensure popup renders
                },


                _insertLargeTextInChunks(text) {
                    const originalLength = text.length;
                    let remainingText = text;

                    App.ui.migrationScreen.show("Pasting Large Text");

                    const processNextChunk = () => {
                        if (App.ui.migrationScreen.state.isCancelled) {
                            App.ui.migrationScreen.hide();
                            App.ui.showToast("Paste cancelled.", "info");
                            return;
                        }
                        if (remainingText.length === 0) {
                            App.ui.migrationScreen.update(100, "Finalizing...");
                            setTimeout(() => {
                                App.ui.migrationScreen.hide();
                                App.ui.showToast('Paste complete!', { type: 'success' });
                                App.state.isArticleDirty = true;
                            }, 200); // Small delay to let user see 100%
                            return;
                        }

                        const progress = Math.round((1 - (remainingText.length / originalLength)) * 100);
                        App.ui.migrationScreen.update(progress, `Processing... ${progress}%`);

                        const chunkSize = 8000;
                        let chunk = remainingText.substring(0, chunkSize);

                        let lastNewline = chunk.lastIndexOf('\n');
                        if (lastNewline > 0 && remainingText.length > chunkSize) {
                            chunk = chunk.substring(0, lastNewline + 1);
                        }

                        const htmlChunk = App.util.textToHtml(chunk);
                        if (htmlChunk.trim() !== '') {
                            document.execCommand('insertHTML', false, htmlChunk);
                        }

                        remainingText = remainingText.substring(chunk.length);

                        setTimeout(processNextChunk, 0);
                    };

                    processNextChunk();
                },

                handleDragOver(e) { e.preventDefault(); e.stopPropagation(); e.target.closest('#article-content').classList.add('drag-over'); },
                handleDragLeave(e) { e.preventDefault(); e.stopPropagation(); e.target.closest('#article-content').classList.remove('drag-over'); },

                async handleImageDrop(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.target.closest('#article-content').classList.remove('drag-over');

                    // This part handles files dragged from your local computer and works correctly.
                    const files = e.dataTransfer.files;
                    if (files && files.length > 0) {
                        for (const file of files) {
                            if (file.type.startsWith('image/')) {
                                App.services.image.processAndInsert(file);
                            }
                        }
                        return; // Exit after handling local files
                    }

                    // --- NEW ROBUST LOGIC for images dragged from other websites ---
                    const html = e.dataTransfer.getData('text/html');
                    if (html) {
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = html;
                        const img = tempDiv.querySelector('img');

                        if (img && img.src) {
                            // Case 1: The image source is a data URL (very common).
                            if (img.src.startsWith('data:')) {
                                const blob = App.util.dataURLtoBlob(img.src);
                                if (blob) {
                                    App.services.image.processAndInsert(blob);
                                } else {
                                    App.ui.showToast('Could not read dragged image data.', { type: 'error' });
                                }
                            }
                            // Case 2: The image source is a regular web URL.
                            else {
                                try {
                                    App.ui.showToast('Downloading image...', { type: 'info' });
                                    const response = await fetch(img.src);
                                    if (!response.ok) throw new Error('Network response was not ok.');
                                    const blob = await response.blob();
                                    App.services.image.processAndInsert(blob);
                                    App.ui.showToast('Image inserted!', { type: 'success' });
                                } catch (error) {
                                    console.error('Error fetching dragged image:', error);
                                    App.ui.showToast('Website blocked action (Copy/Download Image and Paste 😼)', { type: 'error' });
                                }
                            }
                        }
                    }
                },

                handleFocusIn(e) {
                    const target = e.target;
                    const imageContainer = target.closest('.image-container, .nk-visual-flashcard');

                    // SURGICAL FIX: Prevent focus events on MCQ explanations or toolbars from killing image selection
                    if (!imageContainer && !target.closest('#image-toolbar, .selection-toolbar, .btn-icon, .nk-mcq-explanation, .nk-accordion-content')) {
                        App.events.deselectImage();
                    }
                },

                async handleContentClick(e) {
                    const target = e.target;
                    const isWriteMode = App.state.currentMode === 'write';

                    // --- TOP PRIORITY: Image Selection & Smart Wrapping ---
                    if (target.tagName === 'IMG') {
                        let container = target.closest('.image-container, .nk-visual-flashcard');

                        // SURGICAL FIX: Wrap "wild" images (e.g. in MCQ explanations) to make them interactive
                        if (!container && target.closest('#article-content')) {
                            container = document.createElement('div');
                            container.className = 'image-container';
                            container.contentEditable = 'false';

                            // Capture dimensions for consistent aspect-ratio resizing
                            target.dataset.originalWidth = target.dataset.originalWidth || target.width || target.naturalWidth || 400;
                            target.dataset.originalHeight = target.dataset.originalHeight || target.height || target.naturalHeight || 300;

                            target.parentNode.insertBefore(container, target);
                            container.appendChild(target);

                            const handle = document.createElement('div');
                            handle.className = 'resize-handle resize-handle-se';
                            container.appendChild(handle);

                            App.state.isArticleDirty = true;
                        }

                        if (container) {
                            App.events.selectImage(container);
                            e.preventDefault();
                            e.stopPropagation();
                            return; // Stop processing MCQ or other clicks when an image is clicked
                        }
                    } else if (App.state.selectedImageContainer && !target.closest('.image-container, .nk-visual-flashcard, #image-toolbar, .btn-icon')) {
                        // Clicked away from image: deselect
                        App.events.deselectImage();
                    }

                    // --- NEW LOGIC FOR FOCUS/STAGE MODE ACCORDIONS ---
                    const focusOverlay = target.closest('.focus-mode-overlay');
                    if (focusOverlay) {
                        const accordionTrigger = target.closest('.nk-accordion-trigger');
                        if (accordionTrigger) {
                            e.preventDefault();
                            e.stopPropagation();
                            const accordion = accordionTrigger.closest('.nk-accordion');
                            if (accordion) {
                                const isOpening = accordion.dataset.state === 'closed';
                                accordion.dataset.state = isOpening ? 'open' : 'closed';
                                accordionTrigger.setAttribute('aria-expanded', String(isOpening));
                            }
                            return; // Stop further processing in this case
                        }
                        // --- END NEW LOGIC ---

                        const session = App.state.focusSession;
                        if (session.isCinematicActive && session.isStageMode) {
                            const wordRevealed = App.events.typewriter.revealNext();
                            if (wordRevealed) {
                                e.preventDefault();
                                e.stopPropagation();
                                return;
                            }
                        }

                        const mcqBlock = target.closest('.nk-mcq-block');
                        if (mcqBlock) {
                            App.events.handleMcqAnswer(e, false);
                        }
                        return;
                    }

                    // Handle Visual Flashcard (Image Occlusion) flip or edit
                    const visualFlashcard = target.closest('.nk-visual-flashcard');
                    if (visualFlashcard) {
                        // Check if edit button was clicked
                        const editBtn = target.closest('.nk-vfc-edit-btn');
                        if (editBtn) {
                            e.preventDefault();
                            e.stopPropagation();
                            // Open whiteboard for editing this VFC using existing reopenFromEmbed
                            App.whiteboard.reopenFromEmbed(visualFlashcard);
                            return;
                        }

                        if (!isWriteMode) {
                            // In read mode: flip the card
                            e.preventDefault();
                            e.stopPropagation();
                            visualFlashcard.classList.toggle('flipped');
                            return;
                        } else {
                            // In write mode: select the flashcard for resizing
                            App.events.selectImage(visualFlashcard);
                            e.stopPropagation();
                            return;
                        }
                    }

                    if (!isWriteMode) {
                        const imageContainer = e.target.closest('.image-container');
                        if (imageContainer) {
                            App.events.selectImage(imageContainer);
                            e.stopPropagation();
                        } else if (App.state.selectedImageContainer && !e.target.closest('#image-toolbar')) {
                            App.events.deselectImage();
                        }
                    }

                    const pdfPill = target.closest('.pdf-attachment-pill');
                    if (pdfPill && !isWriteMode) {
                        e.preventDefault();
                        e.stopPropagation();
                        const attachmentId = pdfPill.dataset.pdfId;
                        if (attachmentId) {
                            App.pdf.viewer.open(attachmentId);
                        }
                        return;
                    }

                    const audioPlayer = target.closest('.nk-audio-player');

                    // Dismiss open audio settings popovers when clicking outside
                    if (!target.closest('.audio-settings-wrapper')) {
                        document.querySelectorAll('.audio-popover-menu').forEach(menu => {
                            menu.style.display = 'none';
                        });
                    }

                    if (audioPlayer) {
                        const playPauseBtn = target.closest('.audio-play-pause-btn');
                        const progressBar = target.closest('.audio-progress-bar');
                        const settingsBtn = target.closest('.audio-settings-btn');
                        const speedBtn = target.closest('.audio-speed-btn');
                        const deleteBtn = target.closest('.audio-delete-btn');

                        if (playPauseBtn) {
                            e.preventDefault();
                            App.audio.handlePlayPause(playPauseBtn);
                        } else if (progressBar) {
                            // Do NOT preventDefault on range input — let native events fire.
                            // The 'input' event listener wired in _initializeSinglePlayer handles seeking.
                            // Just ensure currentTime syncs on click too.
                            const audio = audioPlayer.querySelector('audio');
                            if (audio) audio.currentTime = progressBar.value;
                        } else if (settingsBtn) {
                            e.preventDefault();
                            e.stopPropagation();
                            const wrapper = settingsBtn.closest('.audio-settings-wrapper');
                            const popover = wrapper ? wrapper.querySelector('.audio-popover-menu') : null;
                            if (popover) {
                                const isVisible = popover.style.display === 'flex' || popover.style.display === 'block';
                                document.querySelectorAll('.audio-popover-menu').forEach(m => m.style.display = 'none');
                                popover.style.display = isVisible ? 'none' : 'flex';
                            }
                        } else if (speedBtn) {
                            e.preventDefault();
                            e.stopPropagation();
                            App.audio.handleSpeedChange(speedBtn);
                        } else if (target.closest('.audio-transcribe-btn')) {
                            e.preventDefault();
                            e.stopPropagation();
                            if (App.license.isPremium()) {
                                App.audio.transcribeAudioBlock(target.closest('.audio-transcribe-btn'));
                            } else {
                                document.querySelectorAll('.audio-popover-menu').forEach(m => m.style.display = 'none');
                                App.ui.showAscensionModal();
                            }
                        } else if (deleteBtn) {
                            e.preventDefault();
                            e.stopPropagation();
                            App.audio.handleDeleteAudio(deleteBtn);
                        }
                        // Do NOT call e.preventDefault() as a catch-all — it blocks native range/input events.
                        return;
                    }

                    const addTileBtn = target.closest('.deck-add-tile-btn');
                    if (addTileBtn) {
                        e.preventDefault();
                        const solidColors = App.commandPalette.state.textileColors.filter(c => !isNaN(c));
                        const randomColor = solidColors[Math.floor(Math.random() * solidColors.length)];
                        const newTileHTML = `
                    <div class="nk-text-tile color-${randomColor}" contenteditable="false" data-color="${randomColor}">
                        <span class="nk-text-tile-icon"></span>
                        <div class="nk-text-tile-color-cycler" title="Cycle Color"><i class="fa-solid fa-palette fa-xs"></i></div>
                        <div class="nk-text-tile-content" contenteditable="true" data-placeholder="New tile..."></div>
                    </div>`;
                        addTileBtn.insertAdjacentHTML('beforebegin', newTileHTML);
                        App.state.isArticleDirty = true;
                        return;
                    }
                    const layoutToggleBtn = target.closest('.deck-layout-toggle');
                    if (layoutToggleBtn) {
                        e.preventDefault();
                        const deck = layoutToggleBtn.closest('.nk-textile-deck');
                        deck.classList.toggle('layout-stack');
                        const isStack = deck.classList.contains('layout-stack');
                        layoutToggleBtn.innerHTML = isStack ? '<i class="fa-solid fa-grip"></i>' : '<i class="fa-solid fa-table-cells"></i>';
                        layoutToggleBtn.title = isStack ? 'Switch to Grid' : 'Switch to Stack';
                        if (isWriteMode) App.state.isArticleDirty = true;
                        return;
                    }

                    const textTile = target.closest('.nk-text-tile');
                    if (textTile) {
                        if (textTile.textContent.trim() === '') return;

                        if (isWriteMode) {
                            const colorCycler = target.closest('.nk-text-tile-color-cycler');
                            if (colorCycler) {
                                e.preventDefault();
                                const colors = App.commandPalette.state.textileColors;
                                const currentColor = textTile.dataset.color || '1';
                                const currentIndex = colors.indexOf(currentColor);
                                const nextColor = colors[(currentIndex + 1) % colors.length];
                                textTile.classList.remove(`color-${currentColor}`);
                                textTile.classList.add(`color-${nextColor}`);
                                textTile.dataset.color = nextColor;
                                App.state.isArticleDirty = true;
                            }
                        }
                        return;
                    }
                    const mcqBlock = target.closest('.nk-mcq-block');
                    if (mcqBlock) {
                        if (App.state.currentMode === 'read') {
                            App.events.handleMcqAnswer(e, false);
                        }
                        else if (App.state.currentMode === 'write') {
                            // Handle delete block button
                            const deleteBlockBtn = target.closest('.nk-mcq-delete-block');
                            if (deleteBlockBtn) {
                                e.preventDefault();
                                const newP = document.createElement('p');
                                newP.innerHTML = '<br>';
                                mcqBlock.parentNode.replaceChild(newP, mcqBlock);
                                App.util.placeCursor(newP);
                                App.state.isArticleDirty = true;
                                return;
                            }

                            // Handle copy block button
                            const copyBlockBtn = target.closest('.nk-mcq-copy-block');
                            if (copyBlockBtn) {
                                e.preventDefault();

                                const article = App.storage.getArticle(App.state.activeArticleId);
                                if (article && (article.isReadOnly || article.preventReExport)) {
                                    return App.ui.showToast('Creator has disabled copying from this note', { type: 'warning' });
                                }

                                // Create a clean clone for clipboard
                                const clonedBlock = mcqBlock.cloneNode(true);
                                clonedBlock.removeAttribute('id'); // Remove ID to prevent duplicates on paste
                                clonedBlock.removeAttribute('data-answered');

                                // Reset option states
                                clonedBlock.querySelectorAll('.nk-mcq-option').forEach(opt => {
                                    opt.classList.remove('correct', 'incorrect');
                                });

                                const htmlContent = clonedBlock.outerHTML;
                                const textContent = clonedBlock.innerText;

                                try {
                                    // Write HTML to clipboard for rich paste support
                                    const blobHtml = new Blob([htmlContent], { type: 'text/html' });
                                    const blobText = new Blob([textContent], { type: 'text/plain' });
                                    const data = [new ClipboardItem({
                                        'text/html': blobHtml,
                                        'text/plain': blobText
                                    })];

                                    navigator.clipboard.write(data).then(() => {
                                        App.ui.showToast('MCQ copied to clipboard!', { type: 'success' });
                                    }).catch(err => {
                                        console.warn("Clipboard HTML write failed, falling back to text", err);
                                        navigator.clipboard.writeText(htmlContent); // Fallback
                                        App.ui.showToast('MCQ HTML copied!', { type: 'success' });
                                    });
                                } catch (err) {
                                    console.error("Clipboard access error", err);
                                    App.ui.showToast('Failed to copy MCQ.', { type: 'error' });
                                }
                                return;
                            }

                            const addBtn = target.closest('.nk-mcq-add-option');
                            if (addBtn) {
                                e.preventDefault();
                                const optionsContainer = mcqBlock.querySelector('.nk-mcq-options');
                                if (optionsContainer.children.length >= 6) {
                                    App.ui.showToast("Maximum of 6 options reached.", { type: 'warning' });
                                    return;
                                }
                                const newOption = document.createElement('div');
                                newOption.className = 'nk-mcq-option';
                                newOption.dataset.isCorrect = 'false';
                                newOption.innerHTML = `<div class="nk-mcq-option-radio"></div><div class="nk-mcq-option-text" contenteditable="true" data-placeholder="New Option"></div><button class="nk-mcq-delete-option" title="Delete Option">&times;</button>`;
                                optionsContainer.appendChild(newOption);
                                App.state.isArticleDirty = true;
                            } else {
                                const optionDiv = target.closest('.nk-mcq-option');
                                if (optionDiv) {
                                    e.preventDefault();
                                    const deleteBtn = target.closest('.nk-mcq-delete-option');
                                    const radioBtn = target.closest('.nk-mcq-option-radio');
                                    if (deleteBtn) {
                                        if (mcqBlock.querySelectorAll('.nk-mcq-option').length > 2) {
                                            optionDiv.remove();
                                            App.state.isArticleDirty = true;
                                        } else {
                                            App.ui.showToast("An MCQ must have at least two options.", { type: 'warning' });
                                        }
                                    } else if (radioBtn) {
                                        mcqBlock.querySelectorAll('.nk-mcq-option').forEach(opt => opt.dataset.isCorrect = 'false');
                                        optionDiv.dataset.isCorrect = 'true';
                                        App.state.isArticleDirty = true;
                                    }
                                }
                            }
                        }
                        return;
                    }
                    const accordionTrigger = target.closest('.nk-accordion-trigger');
                    const tagSuggestion = target.closest('.tag-suggestion');
                    const checkboxBox = target.closest('.nk-checkbox-box');
                    const timelineAddButton = target.closest('.nk-timeline-add button');
                    if (accordionTrigger) {
                        const accordion = accordionTrigger.closest('.nk-accordion');
                        const reversibleToggle = target.closest('.nk-accordion-reversible-toggle');
                        const hintBtn = target.closest('.nk-accordion-hint-btn');
                        if (reversibleToggle && isWriteMode) {
                            e.preventDefault();
                            const isReversible = accordion.dataset.reversible === 'true';
                            accordion.dataset.reversible = String(!isReversible);
                            reversibleToggle.classList.toggle('active', !isReversible);
                            App.state.isArticleDirty = true;
                        } else if (hintBtn) {
                            e.preventDefault();
                            let hintEditor = accordion.querySelector('.nk-accordion-hint-editor');
                            if (hintEditor) {
                                const isHidden = hintEditor.style.display === 'none';
                                hintEditor.style.display = isHidden ? 'block' : 'none';
                            } else if (isWriteMode) {
                                hintEditor = document.createElement('div');
                                hintEditor.className = 'nk-accordion-hint-editor';
                                const hintContent = document.createElement('div');
                                hintContent.className = 'nk-accordion-hint-content';
                                hintContent.contentEditable = true;
                                hintContent.dataset.placeholder = 'Type your hint here...';
                                hintEditor.appendChild(hintContent);
                                accordion.appendChild(hintEditor);
                                hintContent.focus();
                            }
                            if (isWriteMode) App.state.isArticleDirty = true;
                        } else {
                            accordion.dataset.state = accordion.dataset.state === 'closed' ? 'open' : 'closed';
                            accordionTrigger.setAttribute('aria-expanded', accordion.dataset.state !== 'closed');
                        }
                        return;
                    }
                    const renderedTag = target.closest('.rendered-tag');
                    if (renderedTag && App.state.currentMode === 'read') {
                        e.preventDefault();
                        e.stopPropagation();
                        const tag = renderedTag.dataset.tag || renderedTag.textContent.replace(/^\[\[|\]\]$/g, '').trim();
                        if (tag) App.events.showTagModal(tag);
                        return;
                    }
                    if (tagSuggestion) {
                        e.preventDefault();
                        e.stopPropagation();
                        clearTimeout(App.state.suggestionTimeout);
                        App.contentTools.tagSelection(tagSuggestion);
                        const contentDiv = document.getElementById('article-content');
                        if (!contentDiv) return;
                        const newContent = contentDiv.innerHTML;
                        await App.events.saveArticle({ content: newContent });
                        App.contentTools.autoSuggestTags(contentDiv);
                        return;
                    }
                    if (checkboxBox) {
                        const wrapper = checkboxBox.closest('.nk-checkbox-wrapper');
                        // Allow interactivity in both write AND read mode
                        if (wrapper && (App.state.currentMode === 'write' || App.state.currentMode === 'read')) {
                            const isChecked = wrapper.getAttribute('data-checked') === 'true';
                            wrapper.setAttribute('data-checked', String(!isChecked));

                            // In write mode, just mark dirty. In read mode, we might need to save explicitly or ensure dirty state is picked up.
                            App.state.isArticleDirty = true;

                            if (App.state.currentMode === 'read') {
                                // In read mode, we want the interaction to feel responsive and save.
                                // Since we modified the DOM directly, we should trigger a save if we are viewing the active article.
                                const contentDiv = document.getElementById('article-content');
                                if (contentDiv) {
                                    // Debounce saving or save immediately depending on preference. 
                                    // For checkboxes, saving immediately (or triggering autosave logic) is good.
                                    // We'll rely on the dirty flag pickup if 'read' mode supports autosave, 
                                    // otherwise we force a save after a short delay to batch clicks.
                                    clearTimeout(this._checkboxSaveTimeout);
                                    this._checkboxSaveTimeout = setTimeout(() => {
                                        const currentContent = contentDiv.innerHTML;
                                        App.events.saveArticle({ content: currentContent }, true); // true for silent save
                                    }, 500);
                                }
                            }
                        }
                        return;
                    }
                    if (timelineAddButton) {
                        const timelineBlock = timelineAddButton.closest('.nk-timeline-block');
                        if (timelineBlock) {
                            const newEntry = document.createElement('div');
                            newEntry.className = 'nk-timeline-entry';
                            newEntry.innerHTML = `<div class="nk-timeline-content"><div class="nk-timeline-date" contenteditable="true">New Date...</div><div class="nk-timeline-title" contenteditable="true">New Event...</div></div>`;
                            timelineBlock.querySelector('.nk-timeline-add').insertAdjacentElement('beforebegin', newEntry);
                            const newDateEl = newEntry.querySelector('.nk-timeline-date');
                            if (newDateEl) { App.util.placeCursor(newDateEl); window.getSelection().selectAllChildren(newDateEl); }
                        }
                        return;
                    }
                },

                handleSelection() {
                    // Use a small timeout to let the browser finalize the selection
                    setTimeout(() => {
                        const selection = window.getSelection();
                        const WC_TOAST_ID = 'wc-selection-toast';

                        if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
                            App.ui.hideSelectionToolbar();
                            App.ui.aiMagic.hide();
                            App.ui.hideToast(WC_TOAST_ID);
                            return;
                        }

                        const range = selection.getRangeAt(0);
                        const container = range.commonAncestorContainer;
                        const parentElement = container.nodeType === 3 ? container.parentNode : container;

                        // Ensure the selection is within our main editor
                        const editor = document.getElementById('article-content');
                        if (!editor || !editor.contains(parentElement)) {
                            return;
                        }
                        if (App.state.currentMode === 'write' && !editor.isContentEditable) {
                            return;
                        }

                        // Check if the selection is purely whitespace
                        if (selection.toString().trim() === '') {
                            App.ui.hideSelectionToolbar();
                            App.ui.aiMagic.hide();
                            App.ui.hideToast(WC_TOAST_ID);
                            return;
                        }

                        if (App.state.currentMode === 'write') {
                            App.ui.showSelectionToolbar(range);
                            App.ui.aiMagic.show(range);
                        }

                        // Show word-count toast (Respect user setting - default OFF)
                        const showWordCount = App.settings.get('showReadModeWordCount');

                        if (showWordCount) {
                            const wordCount = selection.toString().trim().split(/\s+/).filter(w => w.length > 0).length;
                            const existing = document.getElementById(WC_TOAST_ID);

                            const htmlMessage = `<div style="display: flex; align-items: center; gap: 8px;"><i class="fa-solid fa-align-left" style="opacity: 0.6; font-size: 0.9em;"></i><span style="font-weight: 500; letter-spacing: 0.3px;">${wordCount} word${wordCount !== 1 ? 's' : ''}</span></div>`;

                            if (existing) {
                                App.ui.updateToast(existing, htmlMessage);
                                existing.style.backgroundColor = "var(--bg-tertiary)";
                                existing.style.color = "var(--text-primary)";
                                existing.style.border = "1px solid var(--border-color)";
                                existing.style.backdropFilter = "blur(12px)";
                                existing.style.boxShadow = "var(--shadow-md)";

                                if (existing.dataset.hideTimeout) clearTimeout(parseInt(existing.dataset.hideTimeout));
                                existing.dataset.hideTimeout = setTimeout(() => {
                                    App.ui.hideToast(existing);
                                }, 2500);
                            } else {
                                const newToast = App.ui.showToast(htmlMessage, { type: 'info', duration: 0, id: WC_TOAST_ID });
                                if (newToast) {
                                    newToast.style.backgroundColor = "var(--bg-tertiary)";
                                    newToast.style.color = "var(--text-primary)";
                                    newToast.style.border = "1px solid var(--border-color)";
                                    newToast.style.backdropFilter = "blur(12px)";
                                    newToast.style.boxShadow = "var(--shadow-md)";

                                    newToast.dataset.hideTimeout = setTimeout(() => {
                                        App.ui.hideToast(newToast);
                                    }, 2500);
                                }
                            }
                        }

                    }, 10);
                },

                wrapMindMapNode() {
                    const selection = window.getSelection();
                    if (!selection || !selection.rangeCount || selection.isCollapsed) return false;

                    let range = selection.getRangeAt(0);
                    const container = range.commonAncestorContainer;
                    const parentElement = container.nodeType === 3 ? container.parentNode : container;

                    if (!parentElement || !parentElement.closest('#article-content')) {
                        App.ui.showToast('Mind Map nodes can only be created in the main editor.', { type: 'warning' });
                        return false;
                    }

                    const paragraph = parentElement.closest('p, div, li, h1, h2, h3, h4, h5, h6, blockquote, td, th');
                    if (!paragraph) {
                        App.ui.showToast("Mind Map nodes can only be created within a text block.", { type: 'warning' });
                        return false;
                    }

                    const fragment = range.cloneContents();
                    const tempDiv = document.createElement('div');
                    tempDiv.appendChild(fragment);

                    // If selection contains only text but parent is stylized, attempt to retain style (similar to cloze logic)
                    if (tempDiv.children.length === 0) {
                        const parentNode = range.commonAncestorContainer.nodeType === 3
                            ? range.commonAncestorContainer.parentElement
                            : range.commonAncestorContainer;
                        if (parentNode && (parentNode.style.color || parentNode.classList.length > 0)) {
                            const wrapper = document.createElement('span');
                            if (parentNode.style.color) wrapper.style.color = parentNode.style.color;
                            if (parentNode.style.backgroundColor) wrapper.style.backgroundColor = parentNode.style.backgroundColor;
                            if (parentNode.className) wrapper.className = parentNode.className;
                            if (wrapper.style.length > 0 || wrapper.className !== '') {
                                wrapper.innerHTML = tempDiv.innerHTML;
                                tempDiv.innerHTML = '';
                                tempDiv.appendChild(wrapper);
                            }
                        }
                    }

                    const selectedHTML = tempDiv.innerHTML;
                    // Default behavior as requested: always force m1. Users can manually change it to m2, m3, etc.
                    document.execCommand('insertHTML', false, `{{m1::${selectedHTML}}}`);

                    selection.collapseToEnd();
                    App.ui.hideSelectionToolbar();
                    return true;
                },

                applyFormatting(type, value) {
                    const selection = window.getSelection();
                    if (!selection || !selection.rangeCount || selection.isCollapsed) return false;
                    let range = selection.getRangeAt(0);
                    const container = range.commonAncestorContainer;
                    const parentElement = container.nodeType === 3 ? container.parentNode : container;

                    if (parentElement.closest('#pdf-text-view-content')) {
                        const text = selection.toString().trim();
                        if (text && type === 'class' && value.startsWith('highlight-')) {
                            App.pdf.highlights.add(text, value);
                        }
                        return true;
                    }

                    if (!parentElement || !parentElement.closest('#article-content')) return false;

                    if (type === 'cloze') {
                        const paragraph = parentElement.closest('p, div, li, h1, h2, h3, h4, h5, h6, blockquote, td, th');
                        if (!paragraph) { App.ui.showToast("Cloze can only be created within a block of text.", { type: 'warning' }); return false; }

                        const existingClozes = (paragraph.innerHTML.match(/{{c\d+::/g) || []).length;

                        const range = selection.getRangeAt(0);
                        const fragment = range.cloneContents();
                        const tempDiv = document.createElement('div');
                        tempDiv.appendChild(fragment);
                        if (tempDiv.children.length === 0) {
                            const parentNode = range.commonAncestorContainer.nodeType === 3
                                ? range.commonAncestorContainer.parentElement
                                : range.commonAncestorContainer;
                            if (parentNode && (parentNode.style.color || parentNode.classList.length > 0)) {
                                const wrapper = document.createElement('span');
                                if (parentNode.style.color) wrapper.style.color = parentNode.style.color;
                                if (parentNode.style.backgroundColor) wrapper.style.backgroundColor = parentNode.style.backgroundColor;
                                if (parentNode.className) wrapper.className = parentNode.className;
                                if (wrapper.style.length > 0 || wrapper.className !== '') {
                                    wrapper.innerHTML = tempDiv.innerHTML;
                                    tempDiv.innerHTML = '';
                                    tempDiv.appendChild(wrapper);
                                }
                            }
                        }
                        const selectedHTML = tempDiv.innerHTML;
                        document.execCommand('insertHTML', false, `{{c${existingClozes + 1}::${selectedHTML}}}`);

                        App.state.isArticleDirty = true;
                        App.events.saveArticle({ isAutosave: true });
                    } else if (type === 'class') {
                        const isTextColor = (App.config.textClasses && App.config.textClasses.includes(value)) || value.startsWith('text-');
                        const isHighlight = (App.config.highlightClasses && App.config.highlightClasses.includes(value)) || value.startsWith('highlight-');
                        const conflictingClasses = isTextColor
                            ? (App.config.textClasses || ['text-red', 'text-green', 'text-blue', 'text-magenta', 'text-orange', 'text-teal', 'text-slate'])
                            : (isHighlight ? (App.config.highlightClasses || ['highlight-1', 'highlight-2', 'highlight-3', 'highlight-4', 'highlight-5', 'highlight-6', 'highlight-7']) : []);

                        // 1. FAST PATH: If selection exactly matches or covers a single parent span with a conflicting color
                        let existingStyledSpan = null;
                        let p = parentElement;
                        while (p && p.id !== 'article-content' && p.tagName === 'SPAN') {
                            if (conflictingClasses.some(c => p.classList.contains(c))) {
                                existingStyledSpan = p;
                                break;
                            }
                            p = p.parentElement;
                        }

                        if (existingStyledSpan && selection.toString().trim() === existingStyledSpan.textContent.trim()) {
                            conflictingClasses.forEach(c => existingStyledSpan.classList.remove(c));
                            existingStyledSpan.classList.add(value);
                            App.state.isArticleDirty = true;
                            if (App.state.currentMode === 'read') App.events.saveArticle({ isAutosave: true });
                            selection.collapseToEnd();
                            App.ui.hideSelectionToolbar();
                            return true;
                        }

                        // 2. GENERAL PATH: Extract selection, strip inner conflicting classes, and cleanly wrap
                        document.execCommand('styleWithCSS', false, true);
                        const span = document.createElement('span');
                        span.className = value;
                        if (isHighlight || isTextColor) {
                            span.id = `snip-${crypto.randomUUID().slice(0, 12)}`;
                        }

                        try {
                            const startBlockEl = range.startContainer.nodeType === 3
                                ? range.startContainer.parentElement.closest('h1,h2,h3,h4,h5,h6,p,li,div,blockquote,td,th')
                                : range.startContainer.closest('h1,h2,h3,h4,h5,h6,p,li,div,blockquote,td,th');
                            if (startBlockEl) {
                                const endBlockEl = range.endContainer.nodeType === 3
                                    ? range.endContainer.parentElement.closest('h1,h2,h3,h4,h5,h6,p,li,div,blockquote,td,th')
                                    : range.endContainer.closest('h1,h2,h3,h4,h5,h6,p,li,div,blockquote,td,th');
                                if (endBlockEl && endBlockEl !== startBlockEl && !startBlockEl.contains(endBlockEl)) {
                                    range.setEndAfter(startBlockEl.lastChild || startBlockEl);
                                }
                            }

                            const fragment = range.extractContents();

                            // Strip conflicting classes and unbold overrides from extracted nodes
                            const innerSpans = Array.from(fragment.querySelectorAll('span'));
                            innerSpans.forEach(el => {
                                if (conflictingClasses.length > 0) {
                                    conflictingClasses.forEach(c => el.classList.remove(c));
                                }
                                el.classList.remove('unbold', 'font-normal');
                                if (el.style.fontWeight === 'normal' || el.style.fontWeight === '400') {
                                    el.style.fontWeight = '';
                                }
                                if (el.classList.length === 0 && !el.style.cssText) {
                                    App.util.unwrapNode(el);
                                }
                            });

                            span.appendChild(fragment);
                            range.insertNode(span);

                            // 3. SPLIT PARENT SPAN IF NESTED INSIDE CONFLICTING COLOR
                            let parentSpan = span.parentElement;
                            if (parentSpan && parentSpan.tagName === 'SPAN' && conflictingClasses.some(c => parentSpan.classList.contains(c))) {
                                const grandParent = parentSpan.parentElement;
                                if (grandParent) {
                                    const beforeRange = document.createRange();
                                    beforeRange.setStart(parentSpan, 0);
                                    beforeRange.setEndBefore(span);
                                    const beforeFrag = beforeRange.extractContents();

                                    const afterRange = document.createRange();
                                    afterRange.setStartAfter(span);
                                    afterRange.setEnd(parentSpan, parentSpan.childNodes.length);
                                    const afterFrag = afterRange.extractContents();

                                    if (beforeFrag.textContent.length > 0) {
                                        const leftSpan = parentSpan.cloneNode(false);
                                        leftSpan.appendChild(beforeFrag);
                                        grandParent.insertBefore(leftSpan, parentSpan);
                                    }

                                    grandParent.insertBefore(span, parentSpan);

                                    if (afterFrag.textContent.length > 0) {
                                        const rightSpan = parentSpan.cloneNode(false);
                                        rightSpan.appendChild(afterFrag);
                                        grandParent.insertBefore(rightSpan, parentSpan.nextSibling);
                                    }

                                    parentSpan.remove();
                                }
                            }

                            // Clean up empty spans
                            const containerBlock = span.closest('h1,h2,h3,h4,h5,h6,p,li,div,blockquote,td,th') || document.getElementById('article-content');
                            if (containerBlock) {
                                containerBlock.querySelectorAll('span').forEach(s => {
                                    if (s !== span && s.textContent === '' && !s.querySelector('img, svg, input')) {
                                        s.remove();
                                    }
                                });
                                containerBlock.normalize();
                            }

                        } catch (e) {
                            App.ui.showToast("Could not apply formatting.", { type: 'error' });
                            console.error("Formatting error:", e);
                            return false;
                        }
                        document.execCommand('styleWithCSS', false, false);
                        App.state.isArticleDirty = true;
                        if (App.state.currentMode === 'read') App.events.saveArticle({ isAutosave: true });
                    }
                    selection.collapseToEnd();
                    App.ui.hideSelectionToolbar();
                    return true;
                },

                toggleBold() {
                    const sel = window.getSelection();
                    if (!sel || sel.isCollapsed || !sel.rangeCount) {
                        document.execCommand('bold', false, null);
                        return;
                    }
                    const range = sel.getRangeAt(0);
                    const parent = sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode;
                    const textSpan = parent?.closest('span[class*="text-"]:not([class*="nk-text"])');
                    const unboldSpan = parent?.closest('.unbold');

                    if (unboldSpan) {
                        // Already unbolded -> re-bold by removing unbold
                        unboldSpan.classList.remove('unbold');
                        if (unboldSpan.classList.length === 0 && !unboldSpan.style.cssText && unboldSpan.tagName === 'SPAN') {
                            App.util.unwrapNode(unboldSpan);
                        }
                    } else if (textSpan) {
                        // Currently bold via text-color -> unbold it
                        if (sel.toString().trim() === textSpan.textContent.trim()) {
                            textSpan.classList.add('unbold');
                        } else {
                            const span = document.createElement('span');
                            span.className = 'unbold';
                            span.appendChild(range.extractContents());
                            range.insertNode(span);
                        }
                    } else {
                        document.execCommand('bold', false, null);
                    }
                    App.state.isArticleDirty = true;
                    if (App.state.currentMode === 'read') App.events.saveArticle({ isAutosave: true });
                },

                cycleColorFormatting() {
                    let currentIndex = App.settings.get('colorCycleIndex');
                    this.applyFormatting('class', App.config.colorCycle[currentIndex]);
                    App.settings.set('colorCycleIndex', (currentIndex + 1) % App.config.colorCycle.length);
                },
                async removeFormatting() {
                    const selection = window.getSelection();
                    if (!selection || !selection.rangeCount || selection.isCollapsed) {
                        App.ui.hideSelectionToolbar();
                        return;
                    }

                    const range = selection.getRangeAt(0);
                    const elementsToUnwrap = new Set();
                    // Important: don't treat FontAwesome icon <i> tags as "italics formatting"
                    const formattingSelector = 'span[class*="highlight-"], span[class*="text-"], b, i:not([class*="fa-"]), u, strong, em, del, .rendered-tag';

                    // 1. Check Ancestors: If selection is inside a formatted element
                    const checkAncestors = (node) => {
                        let curr = node.nodeType === 3 ? node.parentElement : node;
                        // Walk up until we hit a block container or the editor root
                        while (curr && curr.id !== 'article-content' && !curr.matches('p, div, li, h1, h2, h3, h4, h5, h6, blockquote, td, th, section, main, article')) {
                            if (curr.matches(formattingSelector)) {
                                elementsToUnwrap.add(curr);
                            }
                            curr = curr.parentElement;
                        }
                    };

                    checkAncestors(range.startContainer);
                    checkAncestors(range.endContainer);

                    // 2. Check Intersecting Nodes: If selection covers/intersects formatted elements
                    let safeAncestor = range.commonAncestorContainer;
                    if (safeAncestor.nodeType === 3) safeAncestor = safeAncestor.parentElement;

                    if (safeAncestor) {
                        const candidates = safeAncestor.querySelectorAll(formattingSelector);
                        candidates.forEach(el => {
                            if (selection.containsNode(el, true)) {
                                elementsToUnwrap.add(el);
                            }
                        });
                    }

                    if (elementsToUnwrap.size > 0) {
                        elementsToUnwrap.forEach(el => {
                            if (document.body.contains(el)) {
                                App.util.unwrapNode(el);
                            }
                        });
                        if (safeAncestor) safeAncestor.normalize();
                    } else {
                        // FIX: Allow removing pure text formats like {{m1::}} or {{c1::}}
                        const selectedText = selection.toString();
                        if (/\{\{[mc]\d+::/i.test(selectedText)) {
                            const unformattedText = selectedText.replace(/\{\{[mc]\d+::([\s\S]*?)\}\}/gi, '$1');
                            document.execCommand('insertText', false, unformattedText);
                        } else {
                            // Fallback to native
                            document.execCommand('removeFormat', false, null);
                        }
                    }

                    App.state.isArticleDirty = true;
                    App.ui.hideSelectionToolbar();
                },


                handleWriterShortcuts(e) {
                    const selection = window.getSelection();
                    if (!selection || !selection.rangeCount) return;
                    const range = selection.getRangeAt(0);

                    const cmdKey = App.util.getCommandKey() === 'Cmd' ? e.metaKey : e.ctrlKey;

                    // Enter key handler for Collapsible Headings
                    if (e.key === 'Enter') {
                        const focusNode = selection.focusNode;
                        const element = focusNode.nodeType === 3 ? focusNode.parentElement : focusNode;

                        // Check if we are inside a collapsible heading
                        const collapsibleHeading = element.closest('.collapsible-heading');

                        if (collapsibleHeading) {
                            e.preventDefault();

                            // Create new paragraph
                            const p = document.createElement('p');
                            p.innerHTML = '<br>';

                            // Insert after the heading
                            if (collapsibleHeading.nextSibling) {
                                collapsibleHeading.parentNode.insertBefore(p, collapsibleHeading.nextSibling);
                            } else {
                                collapsibleHeading.parentNode.appendChild(p);
                            }

                            // Move cursor to the new paragraph
                            const newRange = document.createRange();
                            newRange.setStart(p, 0);
                            newRange.collapse(true);
                            selection.removeAllRanges();
                            selection.addRange(newRange);

                            App.state.isArticleDirty = true;
                            return;
                        }
                    }

                    // Tab key handler for list indentation (industry standard behavior)
                    if (e.key === 'Tab') {
                        const focusNode = selection.focusNode;
                        const listItem = focusNode?.nodeType === 3
                            ? focusNode.parentElement?.closest('li')
                            : focusNode?.closest('li');

                        // Case 1: Inside a list item - handle bullet nesting
                        if (listItem) {
                            e.preventDefault();

                            if (e.shiftKey) {
                                // Shift+Tab: Outdent (decrease nesting)
                                document.execCommand('outdent', false, null);
                            } else {
                                // Tab: Indent (increase nesting)
                                document.execCommand('indent', false, null);
                            }
                            App.state.isArticleDirty = true;
                            return;
                        }

                        // Case 2: Standard Paragraph Indentation (User Request)
                        const container = range.commonAncestorContainer;
                        const parentElement = container.nodeType === 3 ? container.parentNode : container;
                        const blockElement = parentElement.closest('p, div, h1, h2, h3, h4, h5, h6, blockquote, pre');

                        if (blockElement && blockElement.closest('#article-content')) {
                            e.preventDefault();

                            const currentMargin = parseInt(window.getComputedStyle(blockElement).marginLeft) || 0;
                            const indentSize = 40; // 40px indent per level

                            if (e.shiftKey) {
                                // Shift+Tab: Outdent (decrease margin)
                                const newMargin = Math.max(0, currentMargin - indentSize);
                                blockElement.style.marginLeft = newMargin > 0 ? `${newMargin}px` : '';
                            } else {
                                // Tab: Indent (increase margin)
                                blockElement.style.marginLeft = `${currentMargin + indentSize}px`;
                            }
                            App.state.isArticleDirty = true;
                            return;
                        }
                    }

                    if (cmdKey && e.key.toLowerCase() === 'j') {
                        e.preventDefault();
                        App.commandPalette.open(range);
                        return;
                    }

                    if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && selection.isCollapsed) {
                        const container = range.startContainer;
                        const tileContent = container.nodeType === 1 ? container.closest('.nk-text-tile-content') : container.parentElement.closest('.nk-text-tile-content');

                        if (tileContent) {
                            const textLength = tileContent.textContent.length;
                            const atStart = range.startOffset === 0;
                            const atEnd = range.startOffset === textLength;

                            if (e.key === 'ArrowLeft' && atStart) {
                                const tile = tileContent.closest('.nk-text-tile');
                                if (tile) { e.preventDefault(); range.setStartBefore(tile); range.collapse(true); selection.removeAllRanges(); selection.addRange(range); return; }
                            } else if (e.key === 'ArrowRight' && atEnd) {
                                const tile = tileContent.closest('.nk-text-tile');
                                if (tile) { e.preventDefault(); range.setStartAfter(tile); range.collapse(true); selection.removeAllRanges(); selection.addRange(range); return; }
                            }
                        }
                    }

                    // --- DEFINITIVE FIX FOR DELETION & UNDO/REDO ---
                    if (e.key === 'Backspace' && selection.isCollapsed) {
                        // NEW: Delete empty textile on backspace (like bullet points/blockquotes)
                        const tileContent = selection.focusNode?.parentElement?.closest('.nk-text-tile-content') ||
                            (selection.focusNode?.nodeType === 1 && selection.focusNode.closest('.nk-text-tile-content'));
                        if (tileContent && tileContent.textContent.trim() === '' && selection.focusOffset === 0) {
                            e.preventDefault();
                            const tile = tileContent.closest('.nk-text-tile');
                            if (tile) {
                                const newP = document.createElement('p');
                                newP.innerHTML = '<br>';
                                tile.parentNode.replaceChild(newP, tile);
                                App.util.placeCursor(newP);
                                App.state.isArticleDirty = true;
                            }
                            return;
                        }

                        // Check for deleting an empty accordion title first
                        const accordion = selection.focusNode.parentElement?.closest('.nk-accordion');
                        const title = accordion?.querySelector('.nk-accordion-title');
                        if (accordion && title && title.contains(selection.focusNode) && selection.focusOffset === 0 && title.textContent.trim() === '') {
                            e.preventDefault(); const newP = document.createElement('p'); newP.innerHTML = '<br>'; accordion.parentNode.replaceChild(newP, accordion); App.util.placeCursor(newP); return;
                        }

                        // Unified Deletion for ALL custom blocks
                        if (range.startOffset === 0) {
                            const container = range.startContainer;
                            const currentBlock = (container.nodeType === 3 ? container.parentElement : container).closest('p, li, h1, h2, h3, h4, h5, h6, div');

                            if (currentBlock) {
                                const elementToDelete = currentBlock.previousElementSibling;
                                // This selector now covers ALL complex, non-editable blocks
                                const customBlockSelector = '.nk-mcq-block, .nk-timeline-block, .nk-textile-deck, .chart-container, .nk-accordion';

                                if (elementToDelete && elementToDelete.matches(customBlockSelector)) {
                                    e.preventDefault();

                                    const sel = window.getSelection();
                                    const newRange = document.createRange();
                                    newRange.selectNode(elementToDelete);
                                    sel.removeAllRanges();
                                    sel.addRange(newRange);
                                    document.execCommand('delete', false, null);

                                    return; // Deletion handled, stop further processing.
                                }
                            }
                        }
                    }

                    if (App.commandPalette.state.isOpen) {
                        if (['ArrowUp', 'ArrowDown', 'Enter', 'Escape', 'Backspace', '/'].includes(e.key)) {
                            e.preventDefault(); e.stopPropagation();
                        }
                        return;
                    }

                    if (e.key === '/' && selection.isCollapsed) {
                        e.preventDefault();
                        App.commandPalette.open(range);
                        return;
                    }

                    if (e.key === 'Enter') {
                        const focusNode = selection.focusNode;
                        const checkboxWrapper = focusNode?.parentElement.closest('.nk-checkbox-wrapper');
                        if (checkboxWrapper) {
                            e.preventDefault();
                            const checkboxText = checkboxWrapper.querySelector('.nk-checkbox-text');
                            if (checkboxText && checkboxText.textContent.trim() === '') {
                                const newP = document.createElement('p'); newP.innerHTML = '<br>';
                                checkboxWrapper.insertAdjacentElement('afterend', newP); checkboxWrapper.remove(); App.util.placeCursor(newP);
                            } else {
                                const newCheckboxHTML = `<div class="nk-checkbox-wrapper" data-checked="false"><span class="nk-checkbox-box"></span><span class="nk-checkbox-text"><br></span></div>`;
                                checkboxWrapper.insertAdjacentHTML('afterend', newCheckboxHTML);
                                const newCheckbox = checkboxWrapper.nextElementSibling; if (newCheckbox) App.util.placeCursor(newCheckbox.querySelector('.nk-checkbox-text'));
                            }
                            App.state.isArticleDirty = true; return;
                        }
                    }

                    if (cmdKey && e.shiftKey) {
                        let shortcutApplied = true;
                        switch (e.key.toLowerCase()) {
                            case 't': App.contentTools.tagSelection(); break; case 'f': App.events.applyFormatting('cloze'); break; case '1': App.events.cycleColorFormatting(); break;
                            case 'm': App.events.wrapMindMapNode(); break;
                            case '2': App.events.applyFormatting('class', 'highlight-1'); break; case '3': App.events.applyFormatting('class', 'highlight-2'); break; case '4': App.events.applyFormatting('class', 'highlight-3'); break;
                            case '5': App.events.applyFormatting('class', 'highlight-4'); break; case '6': App.events.applyFormatting('class', 'highlight-5'); break; case '7': App.events.applyFormatting('class', 'highlight-6'); break;
                            case '8': App.events.applyFormatting('class', 'text-green'); break; case '9': App.events.applyFormatting('class', 'text-red'); break; case '0': App.events.applyFormatting('class', 'text-blue'); break; case '-': App.events.applyFormatting('class', 'text-magenta'); break;
                            default: shortcutApplied = false;
                        }
                        if (shortcutApplied) { e.preventDefault(); return; }
                    }

                    if (cmdKey && (e.key.toLowerCase() === 'b' || e.key.toLowerCase() === 'i' || e.key.toLowerCase() === 'u')) {
                        e.preventDefault();
                        const key = e.key.toLowerCase();
                        if (key === 'b') {
                            App.events.toggleBold();
                        } else {
                            const command = { 'i': 'italic', 'u': 'underline' }[key];
                            document.execCommand(command);
                        }
                        return;
                    }

                    if (!range || !range.startContainer) return;

                    if (e.key === 'Enter') {
                        const container = range.commonAncestorContainer;
                        const parentElement = container.nodeType === 3 ? container.parentNode : container;
                        const blockToExit = parentElement.closest('blockquote, li');
                        if (blockToExit && parentElement.textContent.trim() === '') {
                            e.preventDefault();
                            document.execCommand('outdent', false, null);
                            return;
                        }
                    }

                    const textNode = range.startContainer;
                    if (e.key === 'Enter' && textNode.nodeType === 3 && textNode.textContent.substring(0, range.startOffset).trim() === '---') {
                        e.preventDefault();
                        const p = textNode.parentElement;
                        p.innerHTML = '';
                        document.execCommand('insertHorizontalRule', false, null);
                        const newP = document.createElement('p'); newP.innerHTML = '<br>';
                        p.insertAdjacentElement('afterend', newP);
                        App.util.placeCursor(newP);
                        return;
                    }

                    if (e.key === ' ' && textNode.nodeType === 3) {
                        const text = textNode.textContent.substring(0, range.startOffset);
                        const trimmedText = text.trim();
                        const shortcuts = {
                            '*': 'insertUnorderedList',
                            '-': () => { document.execCommand('insertUnorderedList'); setTimeout(() => { const list = window.getSelection().focusNode.parentElement.closest('ul'); if (list) list.className = 'bullet-hyphen'; }, 0); },
                            '>': () => document.execCommand('formatBlock', false, 'blockquote'),
                            '##': () => document.execCommand('formatBlock', false, 'h2')
                        };
                        const listMatch = text.match(/(\d+)\.$/);
                        const action = shortcuts[trimmedText];

                        if (action) {
                            e.preventDefault();
                            textNode.textContent = text.slice(0, text.length - trimmedText.length) + '\u00A0';
                            range.setStart(textNode, text.length - trimmedText.length + 1);
                            selection.removeAllRanges(); selection.addRange(range);
                            if (typeof action === 'string') document.execCommand(action, false); else action();
                        } else if (listMatch) {
                            e.preventDefault();
                            textNode.textContent = text.slice(0, -listMatch[0].length) + '\u00A0';
                            range.setStart(textNode, text.length - listMatch[0].length + 1);
                            selection.removeAllRanges(); selection.addRange(range);
                            document.execCommand('insertOrderedList', false);
                        }
                    }
                },

                handleListClick() {
                    const now = new Date().getTime();
                    if (now - App.state.lastClickTime < 300) { document.execCommand('insertOrderedList', false); }
                    else {
                        const selection = window.getSelection(); if (!selection.focusNode) return;
                        const focusElement = selection.focusNode.nodeType === Node.TEXT_NODE ? selection.focusNode.parentElement : selection.focusNode;
                        const list = focusElement.closest('ul');
                        if (list) { const currentStyleIndex = App.config.bulletCycle.indexOf(list.className); const nextStyleIndex = (currentStyleIndex + 1) % App.config.bulletCycle.length; list.className = App.config.bulletCycle[nextStyleIndex]; }
                        else { document.execCommand('insertUnorderedList', false); }
                    }
                    App.state.lastClickTime = now;
                },
                showTableModal() {
                    const selection = window.getSelection(); const contentDiv = document.getElementById('article-content');
                    if (selection.rangeCount === 0 || !contentDiv.contains(selection.getRangeAt(0).commonAncestorContainer)) { App.ui.showToast("Please place your cursor in the editor first.", { type: 'error' }); return; }

                    // Insert a temporary marker to hold the cursor position
                    const range = selection.getRangeAt(0);
                    const markerId = `nk-cursor-marker-${Date.now()}`;
                    const markerNode = document.createElement('span');
                    markerNode.id = markerId;
                    range.insertNode(markerNode);
                    App.state.cursorMarkerId = markerId;

                    const table = markerNode.closest('table');
                    let currentRows = 2, currentCols = 2; let title = 'Create Table';
                    if (table) { title = 'Update Table Dimensions'; currentRows = table.rows.length; currentCols = table.rows[0] ? table.rows[0].cells.length : 0; }
                    const message = `<p>${table ? 'Enter new dimensions for the table.' : 'Enter table dimensions. Press Enter for 2x2.'}</p><div class="settings-grid" style="grid-template-columns: auto 1fr; gap: 0.5rem 1rem;"><label for="table-rows-input">Rows</label><input type="number" id="table-rows-input" class="text-input" value="${currentRows}" min="1" style="width:100%;"><label for="table-cols-input">Columns</label><input type="number" id="table-cols-input" class="text-input" value="${currentCols}" min="1" style="width:100%;"></div>`;
                    App.ui.showConfirmationModal({ title, message, confirmText: table ? 'Update' : 'Create', onConfirm: () => { const rows = parseInt(document.getElementById('table-rows-input').value, 10); const cols = parseInt(document.getElementById('table-cols-input').value, 10); if (isNaN(rows) || isNaN(cols) || rows < 1 || cols < 1) { App.ui.showToast("Invalid dimensions.", { type: 'error' }); return; } App.events.table.createOrUpdate(rows, cols); } });
                    const rowsInput = document.getElementById('table-rows-input'); const colsInput = document.getElementById('table-cols-input'); const confirmBtn = document.getElementById('modal-confirm'); const handleEnter = e => { if (e.key === 'Enter') { e.preventDefault(); confirmBtn.click(); } };
                    rowsInput.addEventListener('keydown', handleEnter); colsInput.addEventListener('keydown', handleEnter); rowsInput.focus(); rowsInput.select();
                },
                table: {
                    // FIX: Added a dedicated `create` function for commands to call directly.
                    create(rows, cols) {
                        let tableHTML = '<table><thead><tr>';
                        for (let c = 0; c < cols; c++) tableHTML += `<th><br></th>`;
                        tableHTML += '</tr></thead><tbody>';
                        for (let r = 1; r < rows; r++) {
                            tableHTML += '<tr>';
                            for (let c = 0; c < cols; c++) tableHTML += `<td><br></td>`;
                            tableHTML += '</tr>';
                        }
                        tableHTML += '</tbody></table><p><br></p>';
                        document.execCommand('insertHTML', false, tableHTML);
                        App.state.isArticleDirty = true;
                    },

                    createTile() {
                        const tileHTML = `<table class="tile-box-table"><tbody><tr><td class="tile-cell"><b><br></b></td></tr></tbody></table><p><br></p>`;
                        document.execCommand('insertHTML', false, tileHTML);
                        App.state.isArticleDirty = true;
                    },

                    update(table, newRows, newCols) {
                        const newTable = document.createElement('table'); newTable.className = table.className;
                        const newTHead = newTable.createTHead(); const newTBody = newTable.createTBody();
                        for (let r = 0; r < newRows; r++) {
                            const newRow = document.createElement('tr');
                            for (let c = 0; c < newCols; c++) {
                                const isHeaderRow = (r === 0 && table.tHead && table.tHead.rows.length > 0);
                                const newCell = document.createElement(isHeaderRow ? 'th' : 'td');
                                if (table.rows[r] && table.rows[r].cells[c]) newCell.innerHTML = table.rows[r].cells[c].innerHTML;
                                else newCell.innerHTML = '<br>';
                                newRow.appendChild(newCell);
                            }
                            if (r === 0 && table.tHead && table.tHead.rows.length > 0) newTHead.appendChild(newRow); else newTBody.appendChild(newRow);
                        }
                        const parent = table.parentNode; const nextSibling = table.nextElementSibling;
                        parent.removeChild(table);
                        if (nextSibling) parent.insertBefore(newTable, nextSibling); else parent.appendChild(newTable);
                        let trailingP = newTable.nextElementSibling;
                        if (!trailingP || trailingP.tagName !== 'P') { trailingP = document.createElement('p'); trailingP.innerHTML = '<br>'; newTable.insertAdjacentElement('afterend', trailingP); }
                        App.util.placeCursor(trailingP, true);
                        App.state.isArticleDirty = true;
                    },

                    createOrUpdate(newRows, newCols) {
                        const markerId = App.state.cursorMarkerId;
                        if (!markerId) { App.ui.showToast("Editor selection lost. Please try again.", { type: 'error' }); return; }

                        const markerNode = document.getElementById(markerId);
                        if (!markerNode) { App.ui.showToast("Cursor marker not found. Please try again.", { type: 'error' }); return; }

                        const table = markerNode.closest('table');

                        const sel = window.getSelection();
                        const range = document.createRange();
                        range.setStartBefore(markerNode);
                        range.collapse(true);
                        sel.removeAllRanges();
                        sel.addRange(range);
                        markerNode.parentNode.removeChild(markerNode);
                        App.state.cursorMarkerId = null;

                        if (table && table.classList.contains('tile-box-table')) { App.ui.showToast("You already created a Box Tile. It cannot be expanded.", { type: 'warning' }); return; }
                        if (!table && newRows === 1 && newCols === 1) this.createTile();
                        else if (table) this.update(table, newRows, newCols);
                        else this.create(newRows, newCols);
                    }
                },

                ai: {
                    saveAiSettings() {
                        // Save Provider from dropdown
                        const providerSelect = document.getElementById('ai-provider-select');
                        if (providerSelect && providerSelect.value) {
                            App.settings.set('aiProvider', providerSelect.value);
                        }

                        // Helper to save key/model
                        const saveField = (provider, keyId, modelId) => {
                            const keyInput = document.getElementById(keyId);
                            if (keyInput) {
                                const val = keyInput.value.trim();
                                if (val) App.settings.set(provider + 'Key', val);
                            }

                            const modelInput = document.getElementById(modelId);
                            if (modelInput) {
                                const mVal = modelInput.value.trim();
                                if (mVal) App.settings.set(provider + 'Model', mVal);
                            }
                        };

                        saveField('openrouter', 'openrouter-key-input', 'openrouter-model-input');
                        saveField('gemini', 'gemini-key-input', 'gemini-model-select');
                        saveField('openai', 'openai-key-input', 'openai-model-input');
                        saveField('huggingface', 'huggingface-key-input', 'huggingface-model-input');

                        App.ui.showToast('AI Hub settings saved!', 'success');
                        App.ui.closeModal();
                    },


                    async executeKashAsk(prompt) {
                        if (!prompt) {
                            App.ui.showToast("Please provide a question for the AI.", "warning");
                            return;
                        }

                        const systemPrompt = `You are 'Kash, the Content Architect,' an expert AI integrated into the NoteKash app. Your mission is to analyze the user's context (the article and any selected text) and their prompt, adopt the persona of a subject matter expert, to write most reliable and meaningful response to Query. Then Act as content architect to generate a beautiful, structured, and aesthetic response using the best components from your HTML Toolkit.

                        **MANDATORY Core Logic Flow (Synthesis Model):**

                        1.  **Analyze the User's Goal:** First, understand the core question in the [User Prompt]. What is the user's primary intent? what he wants from you? Does he mention his answer to be in any particular format/template?

                        2.  **Analyze Provided Context:** Second, review the provided [Article Content]. Does it contain information directly relevant to the user's question?

                        3.  **Synthesize and Respond (CRITICAL):**
                            * IMPORTANT: In both "if and else" cases remember You MUST ALWAYS Act as Subject Matter Expert (SME) (e.g an elite economist for finance, a Indian Historian for Gupta Empire, An Polity Expert for Consitution, Top notch Financial advisor for Mutual funds etc.) So you inshort develop the most relevant and Best Persona according to what is being Asked to Answer in precise, authoritative, logical, purposeful and contextually appropriate manner, reflecting the depth of your knowledge and experience in that domain
                            * **IF the user's question is general knowledge** (e.g., "What happens when we die?", "Explain quantum physics") and is unrelated to the [Article Content], you MUST answer using your own vast, general knowledge base. Do NOT mention the article's context if it's irrelevant.
                            * **ELSE (if the question IS related to the context):** You MUST formulate a comprehensive answer by intelligently combining your own expert knowledge with the specific details, facts, and nuances found in the [Article Content]. This creates a richer, more personalized response.
                           
                        4.  **Format the Output:** After formulating your expert answer, act as a 'Content Architect'. Choose the single best component from your HTML toolkit to present the information in the most beautiful and effective way.
                        **Core Principle: Text Styling**
                        This is critical for readability. In ALL your responses, you MUST use \`<b>\` tags to bolden the most important keywords, names, dates, and facts. Use \`<em>\` (italic) for secondary emphasis. This makes notes visually aesthetic an skimmable.

                        **Your Component Toolkit to USE (Must Use):**

                        1.  **Accordion (\`<div class="nk-accordion">\`):**
                            * **Use Case:** Your primary tool for any explicit or implicit Question & Answer. If the user asks "What is...", "How does...", or "Explain...", this is almost always the best choice.
                            * **HTML:** \`<div class="nk-accordion" data-state="open"><div class="nk-accordion-trigger"><span class="nk-accordion-title"><b>USER_QUESTION_HERE</b></span>...</div><div class="nk-accordion-content"><p>YOUR_ANSWER_HERE</p></div></div>\`

                        2.  **Decktile with Text Tiles (\`<div class="nk-textile-deck">\`):**
                            * **Use Case:** Use this to group several related, short pieces of information. Excellent for listing key features, components, or related concepts (e.g., "list the types of...", "what are the main pillars of...").
                            * **HTML:** \`<div class="nk-textile-deck" contenteditable="false"><div class="nk-text-tile color-1">...</div><div class="nk-text-tile color-2">...</div></div>\`

                        3.  **Textile (\`<div class="nk-text-tile">\`):**
                            * **Use Case:** Use sparingly for a single, high-impact fact, definition, or key takeaway that needs to stand out on its own.
                            * **HTML:** \`<div class="nk-text-tile color-default"><span class="nk-text-tile-icon">💡</span><div class="nk-text-tile-content">YOUR_ANSWER_HERE</div></div>\`

                        4.  **Table (\`<table>\`):**
                            * **Use Case:** When the user asks for a comparison, a list of items with multiple properties, or structured data (e.g., "list the pros and cons", "table of planets and their moons").
                            * **Action:** Generate a standard HTML \`<table>\` with \`<th>\` headers.

                        5.  **Bulleted/Numbered List (\`<ul>\`/\`<ol>\`):**
                            * **Use Case:** When the user asks to "list the steps", "outline the reasons", or any request for multiple distinct points where a table is overly complex.

                        6.  **Default (Blockquote):**
                            * **Use Case:** Your fallback for general statements, opinions, or when no other component fits perfectly.
                            * **HTML:** \`<blockquote><p>YOUR_ANSWER_HERE</p></blockquote>\`
                            
                        7.  **Colored Text:** For styled sentences and short paragraphs (for most important sentences and parts of our content).
                            * **Triggers:** "in red text", "in green", "in blue color", "in magenta".
                            * **Classes:** \`text-red\`, \`text-green\`, \`text-blue\`, \`text-magenta\`.
                            * **HTML Structure:** \`<p class="CLASS_NAME_HERE">YOUR_ANSWER_HERE</p>\`

                        **Final Rules (CRITICAL):**
                        * Respond ONLY with the final, complete HTML snippet.
                        * Do NOT include any conversational filler, greetings, or explanations outside of the HTML you generate.`;

                        const result = await App.services.ai.queryGenerativeAI(systemPrompt, prompt);

                        if (result && result.trim()) {
                            const answerHtml = result.trim().replace(/^```(html)?\n?/, '').replace(/\n?```$/, '');

                            // --- Smart Insertion Logic ---
                            const selection = window.getSelection();
                            if (selection && selection.rangeCount > 0) {
                                const range = selection.getRangeAt(0);
                                const container = range.commonAncestorContainer;
                                const parentBlock = (container.nodeType === 3 ? container.parentElement : container)
                                    .closest('p, li, h1, h2, h3, h4, h5, h6, blockquote, div');

                                if (parentBlock && document.getElementById('article-content').contains(parentBlock)) {
                                    parentBlock.insertAdjacentHTML('afterend', answerHtml);
                                } else {
                                    document.execCommand('insertHTML', false, answerHtml);
                                }
                            } else {
                                document.execCommand('insertHTML', false, answerHtml);
                            }

                            App.state.isArticleDirty = true;
                        } else {
                            App.ui.showToast("The AI did not provide an answer. Please try again.", "warning");
                        }
                    },

                    async executeKashAskOnModal(prompt, format = 'auto') {
                        if (!prompt) {
                            App.ui.showToast("Please provide a question for the AI.", "warning");
                            return;
                        }

                        // --- MODULAR PROMPT SYSTEM ---

                        const PROMPT_IDENTITY = `You are 'Kash, the Content Architect,' an expert AI integrated into the NoteKash app. Your mission is to analyze the user's context (the article and any selected text) and their prompt, adopt the persona of a subject matter expert, to write most reliable and meaningful response to Query. Then Act as content architect to generate a beautiful, structured, and aesthetic response using the best components from your HTML Toolkit.`;

                        const PROMPT_CORE_LOGIC = `
                        **MANDATORY Core Logic Flow (Synthesis Model):**
                        1.  **Analyze the User's Goal:** Understand the core question. What is the user's primary intent?
                        2.  **Analyze Provided Context:** Review the provided [Article Content]. Does it contain information directly relevant to the user's question?
                        3.  **Synthesize and Respond (CRITICAL):**
                            * IMPORTANT: You MUST ALWAYS Act as Subject Matter Expert (SME). Develop the most relevant and Best Persona according to what is being Asked.
                            * Answer in precise, authoritative, logical, purposeful and contextually appropriate manner, reflecting the depth of your knowledge.
                            * If context is provided and relevant, combine it with your knowledge. If not, use your own vast knowledge base.
                        `;

                        const PROMPT_BEAUTY = `
                        **Core Principle: Aesthetic Coloring (MANDATORY)**
                        You have access to **7 Text Colors** to make the notes look beautiful, vibrant, and alive. You also can use native formatting tools of Bold/Italics with or apart from them to give you Plenty options to present output well.
                        1.  **The 7 Colors:**
                            *   \`class="text-red"\` (MANDATORY for **Headlines** and **Questions**)
                            *   \`class="text-green"\`
                            *   \`class="text-blue"\`
                            *   \`class="text-magenta"\`
                            *   \`class="text-orange"\`
                            *   \`class="text-teal"\`
                            *   \`class="text-slate"\`
                        2.  **Usage Strategy:**
                            *   **Headlines & Questions (CRITICAL):** You MUST use \`text-red\` for all subtitles, questions, or section headers to create a clear visual hierarchy.
                            *   **Variety is Beauty:** Use the other 6 colors freely for important keywords, dates, quotes, statistics, or emphasis. Mix them up to create a "premium" feel.
                            *   **Beautify, Don't Clutter:** Do NOT color every single word. That looks ugly. Only color the *most* important parts (approx. 10-20% of text).
                            *   **Constraint:** Apply colors on top of \`<b>\` tags for maximum pop (e.g., \`<b class="text-blue">Key Concept</b>\`).
                        `;

                        // --- TOOLKITS ---
                        const TOOLKIT = {
                            mcq: `
                            **Your Primary Component: Native MCQ Block (CRITICAL):**
                            *   **Instruction:** You MUST output the answer as a series of Native MCQ Blocks.
                            *   **HTML Structure for EACH Question:**
                                \`\`\`html
                                <div class="nk-mcq-block" contenteditable="false">
                                    <div class="nk-mcq-toolbar">
                                        <button class="nk-mcq-copy-block" title="Copy MCQ"><i class="fa-solid fa-copy"></i></button>
                                        <button class="nk-mcq-delete-block" title="Delete MCQ"><i class="fa-solid fa-trash"></i></button>
                                    </div>
                                    <div class="nk-mcq-question" contenteditable="true">YOUR_QUESTION_HERE</div>
                                    <div class="nk-mcq-options">
                                        <!-- Repeat for each option (usually 4) -->
                                        <div class="nk-mcq-option" data-is-correct="false"> <!-- Set "true" ONLY for the correct answer -->
                                            <div class="nk-mcq-option-radio"></div>
                                            <div class="nk-mcq-option-text" contenteditable="true">OPTION_TEXT</div>
                                            <button class="nk-mcq-delete-option" title="Delete Option">&times;</button>
                                        </div>
                                    </div>
                                    <!-- Use text-colors in explanation to make it beautiful -->
                                    <div class="nk-mcq-explanation" contenteditable="true">YOUR_EXPLANATION_HERE</div>
                                </div>
                                \`\`\`
                            `,
                            cloze: `
                            **Your Primary Component: Cloze Flashcard Injection (CRITICAL):**
                            *   **Instruction:** Rewrite the text/answer, but actively CONVERT key information into Cloze Flashcards.
                            *   **Syntax:** Use \`{{c1::Answer}}\`, \`{{c2::Answer}}\` syntax.
                            *   **Strategy:**
                                *   If the prompt is a simple fact, turn it into a sentence with a cloze.
                                *   If explaining a concept, write the explanation and hide the key term.
                            *   **Example Output:**
                                <p>The <b class="text-blue">{{c1::Mitral Valve}}</b> is located between the left atrium and left ventricle.</p>
                            `,
                            accordion: `
                            **Your Primary Component: Accordion (CRITICAL):**
                            *   **Instruction:** You MUST output the answer as a series of Interactive Accordions (Q&A style).
                            *   **HTML Structure:**
                                \`\`\`html
                                <div class="nk-accordion" data-state="open">
                                    <div class="nk-accordion-trigger"><span class="nk-accordion-title"><b>QUESTION_HERE</b></span><i class="fa-solid fa-chevron-down"></i></div>
                                    <div class="nk-accordion-content"><p>YOUR_ANSWER_HERE_WITH_BOLD_AND_COLORS</p></div>
                                </div>
                                \`\`\`
                            `,
                            decktile: `
                            **Your Primary Component: Decktile (CRITICAL):**
                            *   **Instruction:** Organize the information into short, colorful tiles.
                            *   **HTML Structure:**
                                \`\`\`html
                                <div class="nk-textile-deck" contenteditable="false">
                                    <div class="nk-text-tile color-1"><div class="nk-text-tile-content">Content 1...</div></div>
                                    <div class="nk-text-tile color-2"><div class="nk-text-tile-content">Content 2...</div></div>
                                    <div class="nk-text-tile color-3"><div class="nk-text-tile-content">Content 3...</div></div>
                                </div>
                                \`\`\`
                            `,
                            table: `
                            **Your Primary Component: Revision Table (CRITICAL):**
                            *   **Instruction:** Create a detailed, beautiful HTML table to compare or list data.
                            *   **Structure:** Use standard \`<table>\`, \`<thead>\`, \`<tbody>\`, \`<tr>\`, \`<th>\`, \`<td>\`.
                            *   **Styling:** Use \`<b>\` and text color classes INSIDE the cells to highlight key data.
                            `,
                            timeline: `
                            **Your Primary Component: Timeline (CRITICAL):**
                            *   **Instruction:** Create a chronological list of events.
                            *   **Structure:** Use a \`<div class="nk-textile-deck">\` where each tile represents an era/year OR a styled HTML list.
                            *   **Preferred Format:** A nice table with two columns: "Time/Era" and "Event Description". Use text colors for dates.
                            `,
                            // Simplified HTML rules for 'Auto' mode
                            basic: `
                            **Formatting Rules:**
                             1. **Paragraphs:** Use standard paragraphs \`<p>\` with extensive use of **Colors** and **Bold**.
                             2. **Tables:** Use \`<table>\` if comparing data.
                             3. **Lists:** Use \`<ul>\` or \`<ol>\` for steps or lists.
                             4. **Blockquotes:** Use \`<blockquote>\` for summaries or quotes.
                            `
                        };

                        // --- DYNAMIC PROMPT ASSEMBLY ---
                        let toolkitInstructions = "";

                        if (format === 'mcq') {
                            toolkitInstructions = TOOLKIT.mcq + "\n**RESTRICTION:** Output ONLY Native MCQ Blocks. Do not use lists or plain text.";
                        } else if (format === 'cloze') {
                            toolkitInstructions = TOOLKIT.cloze + "\n**RESTRICTION:** Focus on creating valid Cloze deletions within the text.";
                        } else if (format === 'accordion') {
                            toolkitInstructions = TOOLKIT.accordion + "\n**RESTRICTION:** Output ONLY Accordions.";
                        } else if (format === 'decktile') {
                            toolkitInstructions = TOOLKIT.decktile + "\n**RESTRICTION:** Output ONLY Decktiles.";
                        } else if (format === 'table') {
                            toolkitInstructions = TOOLKIT.table + "\n**RESTRICTION:** Output ONLY a HTML Table.";
                        } else if (format === 'timeline') {
                            toolkitInstructions = TOOLKIT.timeline + "\n**RESTRICTION:** Focus on chronological order and dates.";
                        } else {
                            // 'auto' or 'text'
                            toolkitInstructions = TOOLKIT.basic + "\n**NOTE:** You may use Tables or Lists if appropriate, but avoid complex interactive components (MCQs, Accordions) unless specifically asked in the user prompt.";
                        }


                        const finalSystemPrompt = `
                        ${PROMPT_IDENTITY}
                        ${PROMPT_CORE_LOGIC}
                        ${PROMPT_BEAUTY}

                        **Your Specific Tool for this Request:**
                        ${toolkitInstructions}

                        **Final Rules (CRITICAL):**
                        *   Respond ONLY with the final, complete HTML snippet.
                        *   Do NOT include any conversational filler, greetings, or explanations outside of the HTML you generate.
                        `;


                        const result = await App.services.ai.queryGenerativeAI(finalSystemPrompt, prompt);

                        if (result && result.trim()) {
                            const answerHtml = result.trim().replace(/^```(html)?\n?/, '').replace(/\n?```$/, '');
                            App.ui.aiMagicModal.renderResponse(answerHtml);
                        } else {
                            App.ui.showToast("The AI did not provide an answer. Please try again.", "warning");
                            // Reset modal state?
                            const commandListEl = document.getElementById('ai-magic-command-list');
                            if (commandListEl && App.ui.aiMagicModal._renderCommands) {
                                App.ui.aiMagicModal._renderCommands(); // Revert to grid
                            }
                        }
                    },


                    async executeKashTranslate(language) {
                        const selection = window.getSelection();
                        const selectedText = selection.toString().trim();
                        if (!selectedText) {
                            App.ui.showToast("Please select text to translate.", "warning");
                            return;
                        }

                        const systemPrompt = `You are an expert translator. Translate the following text to ${language}. Respond ONLY with the translated text, without any explanations, quotes, or conversational filler.`;
                        const result = await App.services.ai.queryGenerativeAI(systemPrompt, selectedText);

                        if (result && result.trim()) {
                            // Collapse the selection to the end to paste after it
                            selection.collapseToEnd();
                            const translationHtml = `<br><i>(${language} translation: ${App.util.escapeHtml(result.trim())})</i>`;
                            document.execCommand('insertHTML', false, translationHtml);
                            App.state.isArticleDirty = true;
                        }
                    },


                    // ─── SHARED UTILITY: Safe, case-insensitive DOM phrase applicator ───────────
                    _applyPhrasesToDOM(rootEl, items, wrapFn, skipSelector) {
                        if (!rootEl || !items || !items.length) return 0;

                        let applied = 0;
                        items.forEach(item => {
                            const phrase = (item.text || '').trim();
                            if (!phrase) return;
                            const lowerPhrase = phrase.toLowerCase();

                            // Rebuild walker for EACH phrase because DOM mutates during wrapFn
                            const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT);
                            let node;

                            while ((node = walker.nextNode())) {
                                // Skip nodes already inside a protected span
                                if (skipSelector && node.parentElement.closest(skipSelector)) continue;

                                const lowerNodeVal = node.nodeValue.toLowerCase();
                                const idx = lowerNodeVal.indexOf(lowerPhrase);
                                if (idx === -1) continue;

                                // Preserve the exact original casing from the article
                                const range = document.createRange();
                                range.setStart(node, idx);
                                range.setEnd(node, idx + phrase.length);

                                try {
                                    wrapFn(range, item);
                                    applied++;
                                } catch (e) {
                                    console.warn('[NoteKash] _applyPhrasesToDOM wrap failed:', e, phrase);
                                }
                                break; // First occurrence only per phrase
                            }
                        });
                        return applied;
                    },
                    // ──────────────────────────────────────────────────────────────────────────────

                    async executeKashTags() {
                        const contentDiv = document.getElementById('article-content');
                        if (!contentDiv || !contentDiv.textContent.trim()) {
                            App.ui.showToast("Article is empty, nothing to tag.", "warning");
                            return;
                        }

                        const systemPrompt = `You are an expert indexer for a knowledge base. Analyze the article and identify the 5-9 most important and representative concepts to be turned into clickable tags.

                        RULES:
                        1. Choose the most concise but complete phrase that represents the concept (e.g., "collegium system" not just "collegium"; "Article 312" not the full constitutional reference).
                        2. The phrase MUST appear verbatim (case may differ) somewhere in the article — do NOT invent phrases.
                        3. No duplicates. Only 5-9 of the most crucial concepts.
                        4. Return ONLY a valid JSON array of objects, each with one key: "tag_text".

                        Example: [{"tag_text": "women representation"},{"tag_text": "Article 312"},{"tag_text": "All India Judicial Service"}]`;

                        const toastId = App.ui.showToast('🤖 KashTags is analysing...', { type: 'info', duration: 0 });
                        const result = await App.services.ai.queryGenerativeAI(systemPrompt, contentDiv.innerText);
                        App.ui.hideToast(toastId);

                        if (result && result.trim()) {
                            try {
                                const jsonMatch = result.match(/\[\s*\{[\s\S]*?\}\s*\]/s);
                                if (!jsonMatch) throw new Error('No JSON array in AI response.');

                                const tagsToApply = JSON.parse(jsonMatch[0]);
                                if (!Array.isArray(tagsToApply)) throw new Error('AI did not return an array.');

                                // Map to the shared utility's {text} format
                                const items = tagsToApply
                                    .filter(t => t && t.tag_text)
                                    .map(t => ({ text: t.tag_text }));

                                App.ui.showToast(`Applying ${items.length} smart tags...`, { type: 'info' });

                                // Use safe DOM walker — NO innerHTML string replace, NO DOM nuke
                                const applied = App.events.ai._applyPhrasesToDOM(
                                    contentDiv,
                                    items,
                                    (range, item) => {
                                        const slug = App.contentTools.slugify(item.text);
                                        const span = document.createElement('span');
                                        span.className = 'rendered-tag';
                                        span.dataset.tag = slug;
                                        range.surroundContents(span);
                                    },
                                    'span.rendered-tag' // skip already-tagged nodes
                                );

                                if (applied > 0) {
                                    App.ui.showToast(`${applied} smart tags applied!`, 'success');
                                    App.state.isArticleDirty = true;
                                } else {
                                    App.ui.showToast('AI suggested tags but none could be matched in the text.', 'info');
                                }

                            } catch (error) {
                                console.error('KashTags Error:', error, 'AI Response:', result);
                                App.ui.showToast('AI returned an invalid format for tagging.', 'error');
                            }
                        } else {
                            App.ui.showToast('AI could not identify any tags to apply.', 'warning');
                        }
                    },

                    async executeKashSummary() {
                        const contentDiv = document.getElementById('article-content');
                        if (!contentDiv || !contentDiv.textContent.trim()) {
                            App.ui.showToast("Nothing to summarize.", "warning");
                            return;
                        }
                        const systemPrompt = "You are a practical, reliable summarizer for a note-taking app. Given a user-provided text, produce a compact, useful summary optimized for quick reading and recall: output a one-line descriptive title (if identifiable) followed by 4–12 concise bullet points that capture the most important facts, conclusions, and action items; each bullet should be short (about 20–35 words). Prefer extractive phrasing (use exact words/short phrases from the text) to avoid hallucination; paraphrase only to improve clarity. Do NOT invent facts — if a requested detail is missing, write 'didn't specify ...' If the source is very short (≤2 sentences), return a 1–2 sentence condensed summary instead of multiple bullets. If the user requests a focus (e.g., 'action items', 'key facts', 'summary for meeting'), prioritize that focus in the bullets. Output only the title and markdown bullet list (no extra explanation, headings, or metadata). Keep tone neutral, language simple, and make the result immediately copy-ready for notes.";
                        const userPrompt = contentDiv.innerText;

                        const summary = await App.services.ai.queryGenerativeAI(systemPrompt, userPrompt);

                        if (summary && summary.trim()) {

                            const summaryHtml = summary.split('\n').map(line => line.trim().replace(/^[\*\-]\s*/, '')).filter(line => line).map(line => `<li>${line}</li>`).join('');

                            const finalHtml = `
                            <div class="nk-text-tile color-ghost-1 ai-summary-tile" contenteditable="true" data-color="ghost-1">
                                <div class="nk-text-tile-content" contenteditable="true">
                                    <h4 style="margin-top: 0; font-weight: 600;" contenteditable="false">Short AI Summary</h4>
                                    <ul style="padding-left: 20px; margin-bottom: 0;">${summaryHtml}</ul>
                                </div>
                            </div><p><br></p>`;


                            const existingSummary = contentDiv.querySelector('.ai-summary-tile');
                            if (existingSummary) {
                                if (existingSummary.nextElementSibling && existingSummary.nextElementSibling.innerHTML === '<br>') {
                                    existingSummary.nextElementSibling.remove();
                                }
                                existingSummary.remove();
                            }

                            contentDiv.insertAdjacentHTML('afterbegin', finalHtml);
                            App.ui.showToast("Summary generated!", "success");
                            App.state.isArticleDirty = true;
                        } else {
                            App.ui.showToast("AI returned an empty summary. Please try again.", "warning");
                        }
                    },

                    async executeKashFlash() {
                        const selection = window.getSelection();
                        const selectedText = selection.toString().trim();

                        if (!selectedText) {
                            App.ui.showToast('Please select text to generate flashcards from.', 'warning');
                            return;
                        }

                        const systemPrompt = `You are a Cloze Deletion Specialist for a note-taking app. Your task is to analyze the user's selected text and identify ONLY the MOST CRITICAL AND IMPORTANT phrases to test via cloze deletion.

                        **What to cloze (in priority order):**
                        1. Key terms / defined concepts (e.g., "Collegium System", "non-justiciable")
                        2. Cause-and-effect results or reasons
                        3. Specific data: numbers, dates, names, statistics
                        4. Critical multi-word phrases representing a single concept

                        **Strict rules & Count limit:**
                        - You MUST NOT cloze too much. Be highly selective. Avoid cloze on short, unimportant sentences.
                        - Only cloze information that a student absolutely must memorize.
                        - 1–2 sentence selection → MAXIMUM 1 to 2 very important clozes.
                        - Full paragraph → MAXIMUM 2 to 5 clozes, each testing a DISTINCT and VITAL concept.

                        **CRITICAL OUTPUT FORMAT:**
                        Return ONLY a valid JSON array of objects. Each object MUST have:
                        - "text": the EXACT phrase from the user's text (verbatim, case-preserved) to be hidden
                        - "id": an integer starting from 1 (c1, c2, c3…)

                        DO NOT return the rewritten text. DO NOT add any commentary.

                        Example input: "The DPSPs are found in Part IV of the Constitution and are non-justiciable."
                        Example output: [{"text": "Part IV", "id": 1}, {"text": "non-justiciable", "id": 2}]`;

                        const toastId = App.ui.showToast('🤖 KashFlash is thinking...', { type: 'info', duration: 0 });

                        try {
                            const result = await App.services.ai.queryGenerativeAI(systemPrompt, selectedText);
                            App.ui.hideToast(toastId);

                            if (!result || !result.trim()) throw new Error('AI returned an empty response.');

                            const jsonMatch = result.match(/\[\s*\{[\s\S]*?\}\s*\]/s);
                            if (!jsonMatch) throw new Error('AI response did not contain a valid JSON array.');

                            const clozePhrases = JSON.parse(jsonMatch[0]);
                            if (!Array.isArray(clozePhrases) || clozePhrases.length === 0)
                                throw new Error('AI returned an empty or invalid array.');

                            // Save the live selection range before any DOM changes
                            const savedRange = selection.getRangeAt(0).cloneRange();

                            // Build a temporary container from the selection HTML to do safe DOM manipulation
                            const fragment = savedRange.cloneContents();
                            const tempDiv = document.createElement('div');
                            tempDiv.appendChild(fragment);

                            // Apply each cloze surgically via the shared DOM walker
                            const applied = App.events.ai._applyPhrasesToDOM(
                                tempDiv,
                                clozePhrases.map(c => ({ text: c.text, id: c.id || 1 })),
                                (range, item) => {
                                    const clozeSpan = document.createElement('span');
                                    // Preserve the exact original text, just wrap in cloze markers
                                    const originalText = range.toString();
                                    clozeSpan.textContent = `{{c${item.id}::${originalText}}}`;
                                    range.deleteContents();
                                    range.insertNode(clozeSpan);
                                },
                                'span[class*="highlight-"]' // don't nest inside backgrounds
                            );

                            if (applied === 0) {
                                App.ui.showToast('AI suggested clozes but none could be matched in the selected text.', 'warning');
                                return;
                            }

                            // Replace the original selection with the processed fragment
                            savedRange.deleteContents();
                            savedRange.insertNode(tempDiv);

                            // Unwrap the temp div (it was just a container)
                            const parent = tempDiv.parentNode;
                            while (tempDiv.firstChild) parent.insertBefore(tempDiv.firstChild, tempDiv);
                            parent.removeChild(tempDiv);

                            App.ui.showToast(`KashFlash: ${applied} cloze(s) created!`, 'success');
                            App.state.isArticleDirty = true;

                        } catch (error) {
                            App.ui.hideToast(toastId);
                            App.ui.showToast('AI could not generate a flashcard. Please try again.', 'warning');
                            console.error('KashFlash Error:', error);
                        }
                    },

                    async executeKashQuestion() {
                        const contentDiv = document.getElementById('article-content');
                        if (!contentDiv || !contentDiv.textContent.trim()) {
                            App.ui.showToast("Nothing in the article to ask questions about.", "warning");
                            return;
                        }
                        const systemPrompt = "You are an AI that generates insightful questions based on a text. Your goal is to create 5 thought-provoking questions that test the reader's comprehension of the main arguments, key facts, and underlying assumptions. Frame them as open-ended questions. Respond ONLY with the questions, each on a new line, formatted as a numbered list.";
                        const userPrompt = contentDiv.innerText;

                        const result = await App.services.ai.queryGenerativeAI(systemPrompt, userPrompt);

                        if (result && result.trim()) {
                            // Convert numbered list from AI into an HTML ordered list
                            const questionsHtml = `<ol>${result.trim().split('\n').map(line => `<li>${line.replace(/^\d+\.\s*/, '')}</li>`).join('')}</ol>`;
                            const finalHtml = `<div class="nk-text-tile color-ghost-2" contenteditable="true"><div class="nk-text-tile-content" contenteditable="true"><h4 style="margin-top:0;" contenteditable="false">Key Questions</h4>${questionsHtml}</div></div><p><br></p>`;
                            contentDiv.insertAdjacentHTML('beforeend', finalHtml);
                            App.ui.showToast("5 Key Questions Generated!", 'success');
                            App.state.isArticleDirty = true;
                        } else {
                            App.ui.showToast("AI could not generate questions.", "warning");
                        }
                    },

                    async executeKashDebate() {
                        const contentDiv = document.getElementById('article-content');
                        if (!contentDiv || !contentDiv.textContent.trim()) {
                            App.ui.showToast("Article is empty, nothing to debate.", "warning");
                            return;
                        }
                        const systemPrompt = "You are an expert debater and critical analyst. Read the following article content, identify its central argument or tone, and then construct a two-column debate table. The first column should powerfully argue FOR the article's position. The second column should present a strong, well-reasoned counter-argument or the opposing perspective. Each column should have a clear heading. Conclude with a persuasive summary for each side. Respond ONLY with the complete HTML for the table, using the app's standard table styling.";
                        const userPrompt = contentDiv.innerText;

                        const result = await App.services.ai.queryGenerativeAI(systemPrompt, userPrompt);

                        if (result && result.trim()) {
                            const cleanedHtml = result.trim().replace(/^```html\n?/, '').replace(/\n?```$/, '');
                            contentDiv.insertAdjacentHTML('beforeend', `<p><br></p>${cleanedHtml}<p><br></p>`);
                            App.ui.showToast("Debate table created!", 'success');
                            App.state.isArticleDirty = true;
                        } else {
                            App.ui.showToast("AI could not generate a debate.", "warning");
                        }
                    },

                    async executeKashLong() {
                        const contentDiv = document.getElementById('article-content');
                        if (!contentDiv || !contentDiv.textContent.trim()) {
                            App.ui.showToast("Nothing to summarize.", "warning");
                            return;
                        }
                        const systemPrompt = "You are an expert summarizer tasked with creating a detailed, comprehensive summary of the provided text. Unlike a brief summary, this summary must capture all key arguments, supporting details, important data points, and named entities without missing any crucial information. The summary should be significantly shorter than the original article but much longer and more detailed than a short summary. Structure the output in well-organized paragraphs. Respond ONLY with the summary text.";
                        const userPrompt = contentDiv.innerText;

                        const result = await App.services.ai.queryGenerativeAI(systemPrompt, userPrompt);

                        if (result && result.trim()) {
                            const paragraphsHtml = result.trim().split('\n').map(p => `<p>${p}</p>`).join('');
                            const finalHtml = `<div class="nk-text-tile color-default" contenteditable="false"><div class="nk-text-tile-content"><h4 style="margin-top:0;">Detailed Summary</h4>${paragraphsHtml}</div></div><p><br></p>`;
                            contentDiv.insertAdjacentHTML('afterbegin', finalHtml);
                            App.ui.showToast("Detailed summary generated!", 'success');
                            App.state.isArticleDirty = true;
                        } else {
                            App.ui.showToast("AI could not generate a detailed summary.", "warning");
                        }
                    },

                    async executeKashCurate() {
                        const contentDiv = document.getElementById('article-content');
                        if (!contentDiv || !contentDiv.textContent.trim()) {
                            App.ui.showToast("There is no content in the note to beautify.", "warning");
                            return;
                        }

                        const systemPrompt = `You are 'KashCurate', an expert AI Content Architect and Designer for the NoteKash app. Your mission is to transform raw text into a beautiful, hierarchical, and effective learning document that uses ALL of NoteKash's powerful features.

                        **Core Directives:**
                        1.  **HIERARCHY & VARIETY ARE MANDATORY:** Your primary goal is to create a visually appealing and easy-to-read document. Do not just put every sentence in a box. You **must** use a rich mix of paragraphs, accordions, MCQs, tables, and a limited number of textiles.
                        2.  **ACTIVE LEARNING FIRST:** Your output must be an active learning tool. Actively create cloze flashcards, Q&A accordions, and multiple-choice questions.

                        **Your Component Toolkit & Curation Rules:**

                        1.  **Paragraphs (<p>):** **This is your default.** Use standard paragraphs for the main narrative, explanations, and connecting information.
                            * **Within paragraphs, you MUST:**
                                * Use \`<b>\` for important keywords.
                                * For key facts, numbers, or terms, create a cloze flashcard. **Example:** The report found that {{c1::14%}} of judges are women.
                                * Use \`==highlight==\` for phrases that deserve visual emphasis but are not flashcards. Highlights and cloze deletions can be used together. **Example:** It's critical to note that ==the conviction rate is {{c1::under 50%}}==.

                        2.  **Accordion (<div class="nk-accordion">):** **Your primary duty is to create these.** Accordions are for short Q&A which you derive after analyzing text. Aim for **at least 3-5 accordions**.
                            * **Use Case:** Actively look for implicit or explicit questions in the text. Convert these into interactive Q&A accordions to promote active recall.
                            * **EXACT HTML STRUCTURE:**
                                \`\`\`html
                                <div class="nk-accordion" data-state="closed">
                                    <div class="nk-accordion-trigger"><span class="nk-accordion-title"><b>What is the main reason for this disparity?</b></span>...</div>
                                    <div class="nk-accordion-content"><p>The primary reason is the collegium system...</p></div>
                                </div>
                                \`\`\`

                        3.  **MCQ Block (<div class="nk-mcq-block">):** Generate **1-2 MCQs** if the text contains suitable factual questions with clear distractors.
                            * **Use Case:** To test specific knowledge points with clear correct and incorrect answers.
                            * **EXACT HTML STRUCTURE:**
                                \`\`\`html
                                <div class="nk-mcq-block" contenteditable="false">
                                    <div class="nk-mcq-toolbar">
                                        <button class="nk-mcq-copy-block" title="Copy MCQ"><i class="fa-solid fa-copy"></i></button>
                                        <button class="nk-mcq-delete-block" title="Delete MCQ"><i class="fa-solid fa-trash"></i></button>
                                    </div>
                                    <div class="nk-mcq-question" contenteditable="true">Which report highlighted the low representation of women?</div>
                                    <div class="nk-mcq-options">
                                        <div class="nk-mcq-option" data-is-correct="true">
                                            <div class="nk-mcq-option-radio"></div>
                                            <div class="nk-mcq-option-text" contenteditable="true">India Justice Report</div>
                                            <button class="nk-mcq-delete-option" title="Delete Option">&times;</button>
                                        </div>
                                        <div class="nk-mcq-option" data-is-correct="false">
                                            <div class="nk-mcq-option-radio"></div>
                                            <div class="nk-mcq-option-text" contenteditable="true">National Judicial Data Grid</div>
                                            <button class="nk-mcq-delete-option" title="Delete Option">&times;</button>
                                        </div>
                                    </div>
                                    <button class="btn btn-secondary nk-mcq-add-option">+ Add Option</button>
                                    <div class="nk-mcq-explanation" contenteditable="true" data-placeholder="Add answer explanation (optional)..."></div>
                                </div>
                                \`\`\`

                        4.  **Textile (<div class="nk-text-tile ...">):** Use these **SPARINGLY (4-7 per document)** for spotlighting the most critical, standalone information.
                            * **Use Case:** For high-impact facts or conclusions that need to be visually distinct. **AVOID using these for every sentence.**
                            * **Example:** \`<div class="nk-text-tile color-2"><div class="nk-text-tile-content">Women constitute nearly <b>38%</b> of the lower judiciary.</div></div>\`

                        5.  **Tables (<table>):** For structured, comparative data.
                            * **Use Case:** If you find data comparing two or more things (e.g., lower vs. higher judiciary stats, pros vs. cons), you **should** structure it in a simple 2-column table.

                        6.  **Blockquote (<blockquote>):** For direct quotes.
                            * **Use Case:** If the text contains a direct quote from a person (e.g., "War is too important..."), you **must** use a blockquote.

                        **Your Thought Process (Follow these steps meticulously):**
                        1.  Read the entire text to understand the core narrative.
                        2.  Write the main story using standard **paragraphs**.
                        3.  Go back through your paragraphs and embed **{{c1::cloze}}** flashcards on all key statistics and facts.
                        4.  Also embed important visual highlights using \`==highlight==\` in paragraphs.
                        5.  Identify any questions or cause-and-effect statements and convert them into **Accordions**.
                        6.  Find suitable facts to test and create **MCQ Blocks**.
                        7.  Find any direct quotes and format them as **Blockquotes**.
                        8.  Look for comparative data points and structure them in a **Table**.
                        9.  Select 4-7 of the most important, standalone facts and pull them out into visually distinct **Textiles**.
                        10. Finally, perform a polish pass, adding \`<b>\`, \`<i>\`, and \`<u>\` to add a final layer of emphasis.

                        Your goal is an elegant, readable document that guides the user's focus and enhances learning, not a cluttered page of boxes. Respond ONLY with the generated HTML.`;

                        const userPrompt = contentDiv.innerText;
                        const msgId = App.ui.showToast("NoteKash AI is curating your note...", { type: 'info', duration: 0 });

                        try {
                            const result = await App.services.ai.queryGenerativeAI(systemPrompt, userPrompt);
                            App.ui.hideToast(msgId);

                            if (result && result.trim()) {
                                const cleanedHtml = result.trim().replace(/^```(html)?\n?/, '').replace(/\n?```$/, '');
                                const separatorHtml = `
                                <div style="text-align: center; margin: 2rem 0;">
                                    <hr style="border: none; border-top: 3px dashed var(--border-color); opacity: 0.6; width: 80%; margin: 0 auto;">
                                    <div style="font-family: var(--font-body); font-weight: 600; color: var(--text-secondary); margin-top: 0.5rem;">
                                        ✨ NoteKash AI Version ✨
                                    </div>
                                </div>
                                `;
                                contentDiv.insertAdjacentHTML('beforeend', separatorHtml + cleanedHtml);
                                contentDiv.querySelectorAll('canvas[data-chart-config]').forEach(canvas => {
                                    App.ui.renderChartOnCanvas(canvas);
                                });
                                const finalElement = contentDiv.lastElementChild;
                                if (finalElement) {
                                    finalElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                                App.ui.showToast("NoteKash AI has curated your note!", 'success');
                                App.state.isArticleDirty = true;
                            } else {
                                App.ui.showToast("AI could not generate a detailed summary.", "warning");
                            }
                        } catch (e) {
                            App.ui.hideToast(msgId);
                            console.error(e);
                            App.ui.showToast("Error curating note.", "error");
                        }
                    },

                    async executeKashPresent() {
                        const contentDiv = document.getElementById('article-content');
                        if (!contentDiv || !contentDiv.textContent.trim()) {
                            App.ui.showToast("There is no content to present.", "warning");
                            return;
                        }

                        const systemPrompt = `You are 'KashPresent', an expert Note Architect and Presentation Designer for the NoteKash app. Your mission is to take the provided content and present it beautifully using NoteKash's native capabilities, creating a ready-to-record presentation script.

                        **Core Directives:**
                        1.  **NO Structural Changes:** You must NOT change the structure, storytelling, narration, or writing manner of the article.
                        2.  **NO Repetition:** Do NOT repeat information. If you present something as an MCQ or Accordion, do not repeat it in a paragraph.
                        3.  **Visual Elegance:** The output must be colorful and beautiful, a "delight to watch".
                        4.  **"Note Architect" Role:** You are building a presentation.
                        5.  **NO Lists:** Do NOT use bullet points (ul) or numbered lists (ol) at all.
                        6.  **RICH FORMATTING (Important):** You MUST use <b>bold</b>, <i>italics</i>, and <u>underline</u> tags generously. A presentation should not be a wall of plain text. emphasize key terms, names, and punchlines.
                            *   Example: "The <b>mitochondria</b> is the <i>powerhouse</i> of the cell."

                        **Your Design Toolkit (Use these specific interactive features):**


                        *   **Headings:** PREFERRED: Use **Red Color** for headings. Example: <h3 class="text-red">Heading Name</h3>.
                        *   **Text Colors:** Use a variety of colors (text-blue, text-green, text-magenta, text-orange, text-teal, text-slate) for important concepts and points. Make it colorful!


                        *   **Essential Sentence Highlights:** Use these specific classes to highlight **ENTIRE sentences** that are critical takeaways worth remembering.
                            *   **Classes:** 'highlight-1' (Yellow), 'highlight-2' (Green), 'highlight-3' (Blue), 'highlight-4' (Red).
                            *   **Usage:** <span class="highlight-1">This is a critical sentence that the user needs to remember.</span>
                            *   **Rule:** Use these for full thoughts/sentences, NOT just single words.
                            *   **Variety:** Do NOT just use one color. Use Red for alerts, Green for positive facts, Yellow/Blue for general info.


                        *   **Accordions (Interactive Question & Answer):**
                            *   Use this for distinct questions found in the text.
                            *   **EXACT HTML STRUCTURE:**
                            \`\`\`html
                            <div class="nk-accordion" data-state="closed">
                                <div class="nk-accordion-trigger"><span class="nk-accordion-title"><b>What is the question?</b></span><i class="fa-solid fa-chevron-down"></i></div>
                                <div class="nk-accordion-content"><p>The answer goes here with <b>bold</b> concepts...</p></div>
                            </div>
                            \`\`\`

                        *   **MCQs (Native Interactive Block):**
                            *   Use this for specific fact-checking logic.
                            *   **EXACT HTML STRUCTURE:**
                            \`\`\`html
                            <div class="nk-mcq-block" contenteditable="false">
                                <div class="nk-mcq-toolbar">
                                    <button class="nk-mcq-copy-block" title="Copy MCQ"><i class="fa-solid fa-copy"></i></button>
                                    <button class="nk-mcq-delete-block" title="Delete MCQ"><i class="fa-solid fa-trash"></i></button>
                                </div>
                                <div class="nk-mcq-question" contenteditable="true">The Question text here?</div>
                                <div class="nk-mcq-options">
                                    <div class="nk-mcq-option" data-is-correct="true">
                                        <div class="nk-mcq-option-radio"></div>
                                        <div class="nk-mcq-option-text" contenteditable="true">Correct Answer</div>
                                        <button class="nk-mcq-delete-option" title="Delete Option">&times;</button>
                                    </div>
                                    <div class="nk-mcq-option" data-is-correct="false">
                                        <div class="nk-mcq-option-radio"></div>
                                        <div class="nk-mcq-option-text" contenteditable="true">Wrong Answer 1</div>
                                        <button class="nk-mcq-delete-option" title="Delete Option">&times;</button>
                                    </div>
                                </div>
                                <div class="nk-mcq-explanation" contenteditable="true" data-placeholder="Explanation...">Explanation text here.</div>
                            </div>
                            \`\`\`

                        *   **Textiles (Visual Tiles - Your Slides):**
                            *   **CRITICAL - VARIETY IS REQUIRED:** You have access to \`color-1\` through \`color-8\`. **USE THEM ALL.**
                            *   **RULE:** NEVER use the same color class for two Textiles in a row. If you used \`color-3\`, the next one MUST be different (e.g., \`color-6\`). Randomize your choices.
                            *   **Content:** The text inside should be punchy and use <b>bold</b> or <i>italics</i>.
                            *   **EXACT HTML STRUCTURE:**
                            \`\`\`html
                            <div class="nk-text-tile color-3">
                                <div class="nk-text-tile-content">
                                    The Content Text Here (No Headings!)
                                </div>
                            </div>
                            \`\`\`

                        *   **Tables:** Use for structured comparisons (Pros vs Cons, Data points).

                        **Strategic Toolkit Usage (The "Note Architect" Strategy):**
                        *   **Exhaust Your Options:** Don't just stick to text. A premium presentation uses EVERY tool in the box.
                        *   **Flow:** Start with a **Textile**, follow with text/highlights, then an **Accordion** for a deep dive, and an **MCQ** to test knowledge.
                        *   **Aesthetics:** Your goal is to make the user say "Wow, this looks premium."

                        **Output Format:**
                        *   Respond ONLY with the generated HTML.
                        *   Do not include markdown code fences (\`\`\`html).
                        *   Ensure all HTML structure (divs, classes, buttons) is exactly as prescribed above.`;

                        const userPrompt = contentDiv.innerText;
                        const msgId = App.ui.showToast("Note Architect is designing your presentation...", { type: 'info', duration: 0 });

                        try {
                            const result = await App.services.ai.queryGenerativeAI(systemPrompt, userPrompt);
                            App.ui.hideToast(msgId);

                            if (result && result.trim()) {
                                const cleanedHtml = result.trim().replace(/^```(html)?\n?/, '').replace(/\n?```$/, '');
                                const separatorHtml = `
                                <div style="text-align: center; margin: 3rem 0;">
                                    <hr style="border: none; border-top: 3px dashed var(--border-color); opacity: 0.6; width: 80%; margin: 0 auto;">
                                    <div style="font-family: var(--font-body); font-weight: 700; color: var(--text-red); margin-top: 0.8rem; font-size: 1.1em; letter-spacing: 0.5px;">
                                        ✨ PRESENTATION MODE ✨
                                    </div>
                                </div>
                                `;
                                contentDiv.insertAdjacentHTML('beforeend', separatorHtml + cleanedHtml);

                                // Re-initialize charts if any
                                contentDiv.querySelectorAll('canvas[data-chart-config]').forEach(canvas => {
                                    App.ui.renderChartOnCanvas(canvas);
                                });

                                const finalElement = contentDiv.lastElementChild;
                                if (finalElement) {
                                    finalElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                                App.ui.showToast("Your presentation is ready!", 'success');
                                App.state.isArticleDirty = true;
                            } else {
                                App.ui.showToast("The Architect couldn't finish the design. Please try again.", "warning");
                            }
                        } catch (e) {
                            App.ui.hideToast(msgId);
                            console.error(e);
                            App.ui.showToast("Error generating presentation.", "error");
                        }
                    },

                    async executeKashTable() {
                        const selection = window.getSelection();
                        const selectedText = selection.toString().trim();

                        if (!selectedText) {
                            App.ui.showToast("Please select text to generate a revision table from.", "warning");
                            return;
                        }

                        const systemPrompt = "You are an AI specializing in creating structured revision tables for students. Analyze the selected text and convert its key information into a concise, well-organized two-column HTML table. The first column should contain the main concepts, terms, or topics. The second column should contain the corresponding definitions, explanations, or key details. Use clear headings for the columns. Respond ONLY with the complete HTML for the table.";

                        const result = await App.services.ai.queryGenerativeAI(systemPrompt, selectedText);

                        if (result && result.trim()) {
                            const cleanedHtml = result.trim().replace(/^```html\n ? /, '').replace(/```$/, '');

                            document.execCommand('insertHTML', false, cleanedHtml + '<p><br></p>');
                            App.ui.showToast("Revision table created!", 'success');
                            App.state.isArticleDirty = true;
                        } else {
                            App.ui.showToast("AI could not generate a table.", "warning");
                        }
                    },

                    async executeKashComedy() {
                        const contentDiv = document.getElementById('article-content');
                        if (!contentDiv || !contentDiv.textContent.trim()) {
                            App.ui.showToast("There's no material to work with! The article is empty.", "warning");
                            return;
                        }

                        const systemPrompt = `You are a sharp, witty stand - up comedian in the style of John Oliver or Hasan Minhaj.Your audience is primarily Hindi / Urdu speakers who understand simple, conversational English.Your job is to take a serious article and turn it into a short(200 - 300 word), hilarious, and memorable comedy routine.

                        ** Your Method:**
                            1. ** Opener:** Start with a relatable, everyday observation that connects to the article's main topic. Invent a personal anecdote. For example: "You know, this whole thing reminds me of my uncle trying to use a smartphone..."
                        2. ** Breakdown with Humor:** Identify 2 - 3 key, serious points from the article.Explain them using funny analogies, exaggeration, and fictional scenarios.Simplify complex ideas.
                        3.  ** The "Desi" Angle:** Connect the topic back to a common experience in an Indian household or society.For example, compare a complex bureaucratic process to trying to get a new gas cylinder or dealing with a government office.
                        4.  ** Closer:** End with a strong punchline that summarizes the absurdity of the situation.

                        ** Rules:**
                        * ** Simple English:** Use easy - to - understand, conversational words.No jargon.
                        * ** Formatting:** Format the output like a script.Use < b > tags for emphasis on punchlines.Do NOT use markdown like **.
                        * ** Response:** Respond ONLY with the comedy routine script, wrapped in a single \`<blockquote>\`.

                        **Example Persona Snippet:**
                        "So I'm reading this thing about... 'gender equity in the judiciary'. Sounds serious, right? My dad heard the word 'judiciary' and immediately asked if I was in trouble with the law again. No, Dad, I'm just trying to write jokes! "`;

                        const userPrompt = contentDiv.innerText;
                        const result = await App.services.ai.queryGenerativeAI(systemPrompt, userPrompt);

                        if (result && result.trim()) {
                            // AI is now instructed to return a blockquote, so we can insert it directly.
                            const comedyHtml = result.trim() + '<p><br></p>';

                            const separatorHtml = `
                            <hr style="border: none; border-top: 3px dashed var(--border-color); opacity: 0.6; width: 80%; margin: 2rem auto;">
                            <div style="text-align: center; font-family: var(--font-body); font-weight: 600; color: var(--text-secondary); margin-bottom: 1rem;">
                                😂 KashComedy Version ✨
                            </div>
                        `;

                            contentDiv.insertAdjacentHTML('beforeend', separatorHtml + comedyHtml);

                            const finalElement = contentDiv.lastElementChild;
                            if (finalElement) {
                                finalElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                            App.ui.showToast("And now for something completely different...", 'success');
                            App.state.isArticleDirty = true;
                        } else {
                            App.ui.showToast("The AI is having writer's block. Please try again.", "warning");
                        }
                    },

                    async executeKashMindmap() {
                        const contentDiv = document.getElementById('article-content');
                        if (!contentDiv || !contentDiv.textContent.trim()) {
                            App.ui.showToast("The article is empty. Add some content first!", "warning");
                            return;
                        }

                        const systemPrompt = `You are a master concept mapper and subject matter expert. Your task is to analyze the provided article and generate a concise, highly insightful mindmap summarizing the core concepts.

                            Hierarchy Architecture:
                            The Article Title automatically acts as the Central Root Node. Do NOT output a root tag (no m0).
                            The mindmap hierarchy radiates outward using m1, m2, and m3:
                            {{m1::Main Branch 1 (Key theme / primary pillar, max 9 sentences)}}
                            {{m2::Sub-topic of Branch 1 (Sub-concept / mechanism, max 9 sentences)}}
                            {{m3::Detail / Example of Sub-topic (Specific data point / rule, max 9 sentences)}}
                            {{m2::Another Sub-topic of Branch 1...}}
                            {{m1::Main Branch 2 (Next primary pillar)...}}

                            Rules:
                            1. NEVER use m0. The Article Title itself is already the central node. Start directly with {{m1::...}} for primary branches radiating from the Article Title.
                            2. Structure hierarchy up to 3 levels:
                               - {{m1::...}} = Primary Category / Main Branch (attached to Article Title)
                               - {{m2::...}} = Sub-topic / Mechanism (attached to the preceding m1)
                               - {{m3::...}} = Detailed point / Example / Formula (attached to the preceding m2)
                               Do NOT use m4 or deeper.
                            3. SUMMARIZATION & FILTERING: Do NOT create too many nodes. Filter out only the most important concepts worth remembering. A mindmap is for summarization and high-yield revision, not whole-text regurgitation.
                            4. NODE CONTENT & LENGTH: Each node can contain rich, explanatory summaries (up to 9 sentences when needed) rather than just trivial phrases.
                            5. ONLY output the mindmap tags (one per line). Use newlines between each tag.
                            6. You can use Bold/Italics inside node text for emphasis on key terms, dates, and formulas.
                            7. Do NOT include introductory/concluding text or markdown code fences.`;

                        const userPrompt = contentDiv.innerText;

                        App.ui.showToast("AI is crafting an intricate mindmap... Please wait.", "info");
                        const result = await App.services.ai.queryGenerativeAI(systemPrompt, userPrompt);

                        if (result && result.trim()) {
                            try {
                                const cleanResult = result.trim().replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, ''); // remove markdown

                                const mindmapHTML = cleanResult.split('\n').filter(line => line.trim() && line.includes('{{m')).map(line => `<p>${line.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`).join('');

                                if (!mindmapHTML) throw new Error("No valid mindmap items found");

                                const separatorHtml = `
                                <hr style="border: none; border-top: 3px dashed var(--border-color); opacity: 0.6; width: 80%; margin: 2rem auto;">
                                <div style="text-align: center; font-family: var(--font-body); font-weight: 600; color: var(--text-secondary); margin-bottom: 1rem;" contenteditable="false">
                                    🧠 AI Generated Mindmap ✨
                                </div>
                            `;

                                contentDiv.insertAdjacentHTML('beforeend', separatorHtml + mindmapHTML + '<p><br></p>');

                                const finalElement = contentDiv.lastElementChild.previousElementSibling;
                                if (finalElement) {
                                    finalElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                                App.ui.showToast("Mindmap generated successfully!", 'success');
                                App.state.isArticleDirty = true;

                            } catch (error) {
                                console.error("KashMindmap Error:", error, "AI Response:", result);
                                App.ui.showToast("AI returned an invalid format for the mindmap.", "error");
                            }
                        } else {
                            App.ui.showToast("The AI could not generate the mindmap. Please try again.", "warning");
                        }
                    },

                    async executeKashKeywords() {
                        const contentDiv = document.getElementById('article-content');
                        if (!contentDiv || !contentDiv.textContent.trim()) {
                            App.ui.showToast("The article is empty. Add some content first!", "warning");
                            return;
                        }

                        const systemPrompt = `You are an expert academic analyst. Your task is to read the provided article and extract the 7-16 most important, unique, or conceptual keywords and short phrases that are essential for understanding the text.

                        CRITICAL: You MUST respond ONLY with a valid JSON array of strings. Do not include any introductory text, explanations, or markdown.

                        Example Response: (e.g in Polity likewise do same for other subject Articles)
                        ["Judicial Appointments", "Collegium System", "Gender Imbalance", "All India Judicial Service", "Article 312", "Representation of Women", "Constitutional Mandate"]`;

                        const userPrompt = contentDiv.innerText;
                        const result = await App.services.ai.queryGenerativeAI(systemPrompt, userPrompt);

                        if (result && result.trim()) {
                            try {
                                const jsonMatch = result.match(/\[[\s\S]*?\]/);
                                if (!jsonMatch) throw new Error("AI did not return a valid JSON array.");

                                const keywords = JSON.parse(jsonMatch[0]);

                                if (!Array.isArray(keywords) || keywords.length === 0) {
                                    App.ui.showToast("AI could not identify any key concepts.", "info");
                                    return;
                                }

                                const solidColors = App.commandPalette.state.textileColors.filter(c => !isNaN(c));
                                const tilesHTML = keywords.map((keyword, index) => {
                                    const color = solidColors[index % solidColors.length];
                                    const escapedKeyword = App.util.escapeHtml(keyword.trim());
                                    return `
                                    <div class="nk-text-tile color-${color}" data-color="${color}" contenteditable="false">
                                        <div class="nk-text-tile-content" contenteditable="true">${escapedKeyword}</div>
                                    </div>`;
                                }).join('');

                                const deckHTML = `
                                <div class="nk-textile-deck" contenteditable="false">
                                    <div class="deck-layout-toggle" title="Toggle Layout"><i class="fa-solid fa-table-cells"></i></div>
                                    ${tilesHTML}
                                </div>`;

                                const separatorHtml = `
                                <hr style="border: none; border-top: 3px dashed var(--border-color); opacity: 0.6; width: 80%; margin: 2rem auto;">
                                <div style="text-align: center; font-family: var(--font-body); font-weight: 600; color: var(--text-secondary); margin-bottom: 1rem;">
                                    🔑 Key Concepts ✨
                                </div>
                            `;

                                contentDiv.insertAdjacentHTML('beforeend', separatorHtml + deckHTML + '<p><br></p>');

                                const finalElement = contentDiv.lastElementChild.previousElementSibling; // a bit of a hack to target the deck
                                if (finalElement) {
                                    finalElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                                App.ui.showToast("Key concepts have been extracted!", 'success');
                                App.state.isArticleDirty = true;

                            } catch (error) {
                                console.error("KashKeywords Error:", error, "AI Response:", result);
                                App.ui.showToast("AI returned an invalid format for keywords.", "error");
                            }
                        } else {
                            App.ui.showToast("The AI could not extract any keywords. Please try again.", "warning");
                        }
                    },

                    async executeKashScript() {
                        const contentDiv = document.getElementById('article-content');
                        if (!contentDiv || !contentDiv.textContent.trim()) {
                            App.ui.showToast("The script needs a story! The article is empty.", "warning");
                            return;
                        }

                        const systemPrompt = `You are a focused, friendly, and witty scriptwriter for a short social media video, like a writer for a top Indian YouTuber. Your job is to turn a serious article into a short, punchy, and funny video script. Your audience is from the Indian subcontinent, so the humor should be relatable.

                        **Your Method:**
                        1.  Read the entire article, but focus on the SINGLE most interesting, surprising, or absurd story. Ignore everything else.
                        2.  Produce a copy-ready spoken script of approximately 250 words (~120 seconds).

                        **Strict Script Rules:**
                        1.  **Hook (CRITICAL):** You MUST begin with a strong, funny, one-line hook (under 24 words) that cleverly summarizes the whole topic. For example, if the topic is complex bureaucracy, a hook could be: "You think getting your Aadhaar card updated was hard? Wait till you hear about this..."
                        2.  **Body:** Write in a conversational style with short, easy-to-say sentences. Structure it into 3-5 clear 'beats' or mini-sections.
                        3.  **Humor:** Scatter 2-4 light, relatable punchlines. Compare complex topics to simple things like cricket, Bollywood, or dealing with family.
                        4.  **Ending:** End with a final, memorable, and funny punchline that leaves a strong impression.

                        **Final Output Rules:**
                        - Do NOT invent facts. Stick to the article's information.
                        - Avoid jargon and complicated words.
                        - Output ONLY the final script text. No titles, no "(Scene start)", no character names, no timestamps, no captions, no metadata. Just the spoken words, ready for a teleprompter.`;

                        const userPrompt = contentDiv.innerText;
                        const result = await App.services.ai.queryGenerativeAI(systemPrompt, userPrompt);

                        if (result && result.trim()) {
                            const scriptText = result.trim();
                            // Convert the plain text script with newlines into proper HTML paragraphs
                            const scriptHtml = App.util.textToHtml(scriptText);

                            const finalHtml = `
                            <div class="nk-text-tile color-ghost-1" contenteditable="false" style="margin-top: 1em; display: block; max-width: 100%;">
                                <span class="nk-text-tile-icon">🎬</span>
                                <div class="nk-text-tile-content" contenteditable="true" style="white-space: normal;">
                                    ${scriptHtml}
                                </div>
                            </div>`;

                            const separatorHtml = `
                            <hr style="border: none; border-top: 3px dashed var(--border-color); opacity: 0.6; width: 80%; margin: 2rem auto;">`;

                            contentDiv.insertAdjacentHTML('beforeend', separatorHtml + finalHtml + '<p><br></p>');

                            const finalElement = contentDiv.lastElementChild.previousElementSibling;
                            if (finalElement) {
                                finalElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                            App.ui.showToast("Your script is ready!", 'success');
                            App.state.isArticleDirty = true;
                        } else {
                            App.ui.showToast("The AI couldn't find a good story. Please try again.", "warning");
                        }
                    },
                    async executeKashStory() {
                        const contentDiv = document.getElementById('article-content');
                        if (!contentDiv || !contentDiv.textContent.trim()) {
                            App.ui.showToast("Can't tell a story about an empty page!", "warning");
                            return;
                        }

                        const systemPrompt = `You are 'Kash, the Story-Weaver,' a creative and witty storyteller for the NoteKash app. Your unique talent is transforming dry, factual articles into short, funny, and highly memorable fictional stories. Your audience is students who need to remember complex information in an engaging way.

                        **Core Mission:**
                        Carefully read the provided article. Identify the single most important subject and create a vivid, fictional narrative to explain it, embedding the article's facts naturally. A great technique is to personify the core concept as a quirky character (e.g., 'The Collegium System was a very exclusive club...').

                        **Storytelling Rules (Checklist):**
                        1.  **Factual Core:** All facts, dates, numbers, and definitions MUST come directly from the article. Use exact phrases where possible. If a fact is missing, state 'Not specified.'
                        2.  **Creative & Funny Fiction:** Weave the facts into a humorous, fictional story. Invent harmless details and funny scenarios to make the facts stick.
                        3.  **Visual Punchlines:** Include 2-3 short, visual, and funny moments to keep the story engaging.
                        4.  **Structure & Length:** The story must be 200-500 words with a clear beginning, middle, and end.
                        5.  **Handling Multiple Subjects:** If the article clearly covers different topics with the same name, create a separate story for each, prefixed with \`Subject: <name>\`.

                        **Final Output Format (CRITICAL):**
                        - Respond ONLY with the story text (and the \`Subject:\` prefix if needed).
                        - DO NOT include titles, headings, explanations, or any text other than the story itself.
                        - Keep story interesting, vivid, memorable, catchy, without using too much jargon.
                        - DO NOT use markdown or code fences.`;

                        const userPrompt = contentDiv.innerText;
                        const result = await App.services.ai.queryGenerativeAI(systemPrompt, userPrompt);

                        if (result && result.trim()) {
                            const storyText = result.trim();
                            const storyHtml = App.util.textToHtml(storyText);

                            const finalHtml = `
                            <div class="nk-text-tile color-ghost-2" contenteditable="false" style="margin-top: 1em; display: block; max-width: 100%;">
                                <span class="nk-text-tile-icon">📖</span>
                                <div class="nk-text-tile-content" contenteditable="true" style="white-space: normal;">
                                    ${storyHtml}
                                </div>
                            </div>`;

                            const separatorHtml = `
                            <hr style="border: none; border-top: 3px dashed var(--border-color); opacity: 0.6; width: 80%; margin: 2rem auto;">`;

                            contentDiv.insertAdjacentHTML('beforeend', separatorHtml + finalHtml + '<p><br></p>');

                            const finalElement = contentDiv.lastElementChild.previousElementSibling;
                            if (finalElement) {
                                finalElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                            App.ui.showToast("A new story has been written!", 'success');
                            App.state.isArticleDirty = true;
                        } else {
                            App.ui.showToast("The AI couldn't spin a tale from this. Please try again.", "warning");
                        }
                    },
                    async executeKashExplain() {
                        const selection = window.getSelection();
                        const selectedText = selection.toString().trim();

                        if (!selectedText) {
                            App.ui.showToast("Please select text to explain.", "warning");
                            return;
                        }

                        const systemPrompt = `You are 'Kash, the Clarifier,' an AI expert integrated into a note-taking app. Your unique skill is to instantly become a world-class specialist on the subject of the user's selected text and then explain it with unparalleled clarity and lucidity for a student.

                        **Your Two-Step Process:**
                        1.  **Act as an Expert:** First, deeply analyze the selected text. If the topic is 'Quantum Physics,' you are a physicist. If it's 'Monetary Policy,' you are an economist.
                        2.  **Teach with Clarity:** Second, use your expertise to generate a compact, copy-ready explanation. Use simple analogies to explain complex topics.

                        **Strict Output Structure (Checklist):**
                        Your response MUST contain ONLY the following, in this exact order:
                        1.  **(Optional) Title:** A one-line title if a clear subject is present.
                        2.  **Summary:** A 1-2 sentence plain-language summary of the core idea.
                        3.  **In-Depth Explanation:** 3-6 short bullet points (\`•\`) covering: what it is, how it works, why it's important, and any key limitations.
                        4.  **Practical Examples:** 2-4 numbered examples. If the topic allows, must be most relevant examples with applications too.

                        **Guiding Principles:**
                        - **Source Fidelity:** Base your explanation strictly on the provided text. Use exact phrases when possible. If a detail is missing, add it from reliable source but make sure you clear the concept to Student.
                        - **Multiple Subjects:** If needed, create separate sections prefixed with \`Subject: <name>\`.

                        **Final Output Format (CRITICAL):**
                        - Respond ONLY with the plain text explanation.
                        - DO NOT include headings (like 'Summary'), explanations about your process, markdown, or code fences.`;

                        const result = await App.services.ai.queryGenerativeAI(systemPrompt, selectedText);

                        if (result && result.trim()) {
                            const explanationText = App.util.escapeHtml(result.trim());
                            const finalHtml = `
                            <div class="nk-text-tile color-ghost-1" contenteditable="false" style="margin-top: 1em; display: block; max-width: 100%;">
                                <span class="nk-text-tile-icon">💡</span>
                                <div class="nk-text-tile-content" contenteditable="true" style="white-space: pre-wrap; font-family: var(--font-body); font-size: 0.9em; line-height: 1.6;">${explanationText}</div>
                            </div>`;

                            selection.collapseToEnd();
                            document.execCommand('insertHTML', false, finalHtml + '<p><br></p>');
                            App.ui.showToast("Explanation generated!", 'success');
                            App.state.isArticleDirty = true;
                        } else {
                            App.ui.showToast("AI could not generate an explanation.", "warning");
                        }
                    },
                    async executeKashMnemonic() {
                        const selection = window.getSelection();
                        const selectedText = selection.toString().trim();

                        if (!selectedText) {
                            App.ui.showToast("Please select text to create a mnemonic from.", "warning");
                            return;
                        }

                        const systemPrompt = `You are a focused mnemonic-maker for a note-taking app. Your task is to analyze the user's selected text, extract the core concept, and generate a compact, copy-ready output for memorization. Use only the provided text and reliable, general knowledge. Prefer using exact phrases from the text ('extractive phrasing').

                        Your response MUST have structure of :
                            **Optional Title:** A single, descriptive title if a clear concept is identifiable. If not, omit this line.
                            **Mnemonics:** Exactly three mnemonic options, labeled precisely as follows:
                            1) Simple & Catchy: [Mnenomic try 1- In english while being catchy]
                            Usage: [An explanation note]
                            2) Subcontinent-Flavored: [Mnenomic try 2- with a basic South Asian cultural flavor]
                            Usage: [An explanation note]
                            3) Acronym/Rhyme: [A short acronym or rhyming phrase].
                            Usage: [An explanation note]

                        **RULES:**
                        - DO NOT include any headings like "Title", "Bullet Points", or "Mnemonics".
                        - DO NOT use jargon, vivid stories, or invent facts. If a detail is missing, write 'Not specified.'
                        - DO NOT wrap your response in code fences or markdown.`;

                        const result = await App.services.ai.queryGenerativeAI(systemPrompt, selectedText);

                        if (result && result.trim()) {
                            const mnemonicText = App.util.escapeHtml(result.trim());
                            // Use a <pre> tag inside a styled div to perfectly preserve the line breaks and spacing from the AI's response.
                            const finalHtml = `
                            <div class="nk-text-tile color-ghost-2" contenteditable="false" style="margin-top: 1em; display: block; max-width: 100%;">
                                <div class="nk-text-tile-content" contenteditable="true" style="white-space: pre-wrap; font-family: var(--font-body); font-size: 0.9em; line-height: 1.6;">${mnemonicText}</div>
                            </div>`;


                            selection.collapseToEnd();
                            document.execCommand('insertHTML', false, finalHtml + '<p><br></p>');
                            App.ui.showToast("Mnemonic generated!", 'success');
                            App.state.isArticleDirty = true;
                        } else {
                            App.ui.showToast("AI could not generate a mnemonic. Please try again.", "warning");
                        }
                    },



                    async executeKashAccordion() {
                        const contentDiv = document.getElementById('article-content');
                        if (!contentDiv || !contentDiv.textContent.trim()) {
                            App.ui.showToast("Your note is empty. Add some content first!", "warning");
                            return;
                        }

                        const toastId = App.ui.showToast('🤖 AI is generating insightful Q&A...', { type: 'info', duration: 0 });
                        const articleContent = contentDiv.innerText;

                        const systemPrompt = `You are an expert educator (of subject you writing QnA on) and content architect for the NoteKash app. Your task is to analyze the provided [Article Content] and, by synthesizing it with your own vast but reliable knowledge base, generate a set of 3 to 8 insightful Question & Answer pairs.

                    **Core Directives:**
                    1.  The questions should probe for deeper understanding, asking "why", "how", and exploring implications.
                    2.  The answers should be concise, clear, and directly address the question, acting as perfect revision material.
                    3.  You must use both the provided text and your own vast knowledge to create the best possible Q&A set for a student.

                    **CRITICAL OUTPUT FORMAT:**
                    Your ENTIRE response MUST be a single, valid JSON array of objects. Do NOT include any other text or markdown.
                    Each object in the array represents one accordion and MUST have two keys:
                    1.  "question": A string for the accordion title.
                    2.  "answer": A string for the accordion content.

                    **Example JSON Response:**
                    [
                        {
                            "question": "What is the primary function of mitochondria?",
                            "answer": "The primary function of mitochondria is to generate most of the cell's energy in the form of adenosine triphosphate (ATP)."
                        },
                        {
                            "question": "How does the collegium system impact judicial appointments?",
                            "answer": "It gives primacy to the Chief Justice of India and the senior-most judges of the Supreme Court in the appointment and transfer of judges, aiming to ensure judicial independence."
                        }
                    ]`;

                        try {
                            const result = await App.services.ai.queryGenerativeAI(systemPrompt, articleContent);
                            App.ui.hideToast(toastId);

                            if (!result || !result.trim()) {
                                throw new Error("AI returned an empty response.");
                            }

                            const jsonMatch = result.match(/\[\s*\{[\s\S]*?\}\s*\]/s);
                            if (!jsonMatch) throw new Error("AI response did not contain a valid JSON array.");

                            const qaPairs = JSON.parse(jsonMatch[0]);
                            if (!Array.isArray(qaPairs) || qaPairs.length === 0) {
                                throw new Error("Parsed data is not a valid array of Q&A pairs.");
                            }

                            const accordionsHTML = qaPairs.map(item => {
                                if (!item.question || !item.answer) return '';
                                const cleanQuestion = App.util.escapeHtml(item.question.trim());
                                const cleanAnswer = App.util.escapeHtml(item.answer.trim());
                                const cardId = 'acc_' + crypto.randomUUID();
                                const contentId = 'acc-content-' + cardId;

                                return `
                                <div class="nk-accordion" data-state="closed" data-id="${cardId}">
                                    <div class="nk-accordion-trigger" role="button" tabindex="0" aria-expanded="false" aria-controls="${contentId}">
                                        <span class="nk-accordion-title" contenteditable="true"><b>${cleanQuestion}</b></span>
                                        <div class="nk-accordion-controls">
                                            <button class="nk-accordion-control-btn nk-accordion-hint-btn" title="Add/Edit Hint">${App.util.icons.hint}</button>
                                            <button class="nk-accordion-control-btn nk-accordion-reversible-toggle" title="Make Reversible">${App.util.icons.reversible}</button>
                                            <svg class="nk-accordion-chevron" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                        </div>
                                    </div>
                                    <div id="${contentId}" class="nk-accordion-content" contenteditable="true"><p>${cleanAnswer}</p></div>
                                </div>`;
                            }).join('');

                            if (!accordionsHTML.trim()) {
                                throw new Error("Failed to generate HTML from AI response.");
                            }

                            const separatorHtml = `
                            <hr style="border: none; border-top: 3px dashed var(--border-color); opacity: 0.6; width: 80%; margin: 2rem auto;">
                            <div style="text-align: center; font-family: var(--font-body); font-weight: 600; color: var(--text-secondary); margin-bottom: 1rem;">
                                ❓ AI Generated Q&A ✨
                            </div>`;

                            contentDiv.insertAdjacentHTML('beforeend', separatorHtml + accordionsHTML + '<p><br></p>');
                            App.ui.showToast(`${qaPairs.length} Q&A accordions generated!`, 'success');
                            App.state.isArticleDirty = true;

                            const finalElement = contentDiv.lastElementChild;
                            if (finalElement) {
                                finalElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }

                        } catch (error) {
                            App.ui.hideToast(toastId);
                            App.ui.showToast(`AI failed: ${error.message}`, "error");
                            console.error("KashAccordion Generation Error:", error);
                        }
                    },

                    async executeKashHighlight() {
                        const contentDiv = document.getElementById('article-content');
                        if (!contentDiv || !contentDiv.textContent.trim()) {
                            App.ui.showToast('Article is empty, nothing to highlight.', 'warning');
                            return;
                        }

                        // ── Apply HEADING highlights NATIVELY FIRST ───────────────────────────
                        // Automatically make all headings red and bold for the app to understand
                        const headings = contentDiv.querySelectorAll('h1, h2, h3, h4, h5, h6, h7');
                        let headingsApplied = 0;
                        headings.forEach(h => {
                            if (!h.classList.contains('text-red')) {
                                h.classList.add('text-red');
                                h.style.fontWeight = 'bold';
                                headingsApplied++;
                            }
                        });

                        // ── DUAL-MODE HIGHLIGHT SYSTEM ─────────────────────────────────────────────


                        const systemPrompt = `You are an intelligent dual-mode highlighting assistant for a note-taking app called NoteKash.

                        Your task: Analyze the article/content while Acting as expert of subject matter before highlighting and return TWO separate highlight lists in a single JSON object.

                        === MODE 1: Background Highlights ("bg_highlights") ===
                        Use for important PHRASES or SENTENCES. These get a colored background block.
                        Available color options (integers 1 to 6): 1 (yellow), 2 (green), 3 (blue), 4 (red), 5 (purple), 6 (teal).
                        Use your intelligence to assign these colors based on the context to make the notes look colorful and distinct while highlighting important sentences/phrases of article.

                        === MODE 2: Text-Color Highlights ("text_highlights") ===
                        Use for SHORT inline keywords or important single-word/short-phrase callouts. These get bold colored text.
                        Available color names: "green", "blue", "orange", "magenta", "teal", "slate".
                        Again, pick contextually using your intelligence. These should be freely/abundantly used!

                        === CRITICAL RULES ===
                        1. Every "text" value MUST be a verbatim phrase that appears in the article (case may differ).
                        2. Do NOT overlap: if a phrase is in bg_highlights, do not repeat it in text_highlights.
                        3. Use your intelligence to decide which sections are important. Context will change across articles. 
                        4. Our overall goal is for the notes to look very colorful and visually engaging, so ENSURE you use ALL available background colors  and ALL text colors across your selections. Also use as many times possible.
                        5. "text_highlights" should be used freely and abundantly for keywords. There should be significantly more text_highlights than bg_highlights.
                        6. IMPORTANT: Do NOT color code or highlight headings/titles as they are already colored in red natively. Focus only on the body text.
                        7. Respond ONLY with a single valid JSON object with exactly two keys: "bg_highlights" and "text_highlights".

                        Example response:
                        {
                          "bg_highlights": [
                            {"text": "the collegium system was established", "color": 1},
                            {"text": "Article 124", "color": 3},
                            {"text": "non-justiciable", "color": 5}
                          ],
                          "text_highlights": [
                            {"text": "Judicial Appointments", "color": "orange"},
                            {"text": "independence of judiciary", "color": "blue"},
                            {"text": "Supreme Court", "color": "teal"}
                          ]
                        }`;

                        const toastId = App.ui.showToast('🤖 KashHighlight is analysing...', { type: 'info', duration: 0 });
                        const result = await App.services.ai.queryGenerativeAI(systemPrompt, contentDiv.innerText);
                        App.ui.hideToast(toastId);

                        if (!result || !result.trim()) {
                            App.ui.showToast('AI could not generate highlights.', 'warning');
                            return;
                        }

                        try {
                            // Robustly extract the first JSON object from the response
                            const jsonMatch = result.match(/\{[\s\S]*\}/s);
                            if (!jsonMatch) throw new Error('AI response did not contain a valid JSON object.');

                            const parsed = JSON.parse(jsonMatch[0]);
                            const bgItems = Array.isArray(parsed.bg_highlights) ? parsed.bg_highlights : [];
                            const textItems = Array.isArray(parsed.text_highlights) ? parsed.text_highlights : [];

                            let totalApplied = headingsApplied;

                            // ── Apply BACKGROUND highlights ───────────────────────────────────────
                            if (bgItems.length > 0) {
                                const bgNormalized = bgItems
                                    .filter(h => h.text && h.color >= 1 && h.color <= 6)
                                    .map(h => ({ text: h.text, color: h.color }));

                                const bgApplied = App.events.ai._applyPhrasesToDOM(
                                    contentDiv,
                                    bgNormalized,
                                    (range, item) => {
                                        const span = document.createElement('span');
                                        span.className = `highlight-${item.color}`;
                                        span.id = `snip-${crypto.randomUUID().slice(0, 12)}`;
                                        range.surroundContents(span);
                                    },
                                    'span[class^="highlight-"]' // skip already highlighted
                                );
                                totalApplied += bgApplied;
                            }

                            // ── Apply TEXT-COLOR highlights ───────────────────────────────────────
                            // Map of AI color names → CSS class names
                            const textColorMap = {
                                green: 'text-green', blue: 'text-blue', orange: 'text-orange',
                                magenta: 'text-magenta', teal: 'text-teal', slate: 'text-slate'
                            };

                            if (textItems.length > 0) {
                                const textNormalized = textItems
                                    .filter(h => h.text && textColorMap[h.color])
                                    .map(h => ({ text: h.text, colorClass: textColorMap[h.color] }));

                                const textApplied = App.events.ai._applyPhrasesToDOM(
                                    contentDiv,
                                    textNormalized,
                                    (range, item) => {
                                        const span = document.createElement('span');
                                        span.className = item.colorClass;
                                        span.style.fontWeight = 'bold';
                                        range.surroundContents(span);
                                    },
                                    'span.text-red, span.text-green, span.text-blue, span.text-orange, span.text-magenta, span.text-teal, span.text-slate'
                                );
                                totalApplied += textApplied;
                            }

                            if (totalApplied > 0) {
                                App.ui.showToast(`${totalApplied} highlights applied (${bgItems.length} background + ${textItems.length} text-color)!`, 'success');
                                App.state.isArticleDirty = true;
                            } else {
                                App.ui.showToast('AI found highlights but they could not be matched in the text.', 'warning');
                            }

                        } catch (error) {
                            console.error('KashHighlight Error:', error, 'AI Response:', result);
                            App.ui.showToast('AI returned an invalid format for highlighting.', 'error');
                        }
                    },

                    async executeImproveWriting() {
                        const selection = window.getSelection();
                        const selectedText = selection.toString().trim();
                        if (!selectedText) {
                            App.ui.showToast("Please select text to get writing suggestions.", "warning");
                            return;
                        }

                        const systemPrompt = `You are an expert writing assistant. A user has selected a piece of text and wants alternative phrasings. Produce rewrites in these tones: "Simpler" (most concise while preserving meaning), "Friendly" (warm, conversational), "Confident" (direct and assertive), "Persuasive" (engaging and influential), "Poetic" (lyrical, using metaphor or rhythm), and "Funny" (witty and humourous with touch of subcontinent). Respond ONLY with a valid JSON array of objects in this exact form: [{"tone":"Simpler","text":"..."}, {"tone":"Friendly","text":"..."}, ...]. The "Simpler" object must be the first item. Preserve the original meaning, avoid inventing facts, keep each rewrite natural and ready to use, and include no extra fields, commentary, or surrounding text.`;

                        const userPrompt = selectedText;
                        const result = await App.services.ai.queryGenerativeAI(systemPrompt, userPrompt);

                        if (result && result.trim()) {
                            try {
                                // Robustly find and parse the JSON array from the AI's response
                                const jsonMatch = result.match(/\[\s*\{[\s\S]*?\}\s*\]/);
                                if (!jsonMatch) throw new Error("AI response did not contain a valid JSON array.");

                                const alternatives = JSON.parse(jsonMatch[0]);
                                if (!Array.isArray(alternatives)) throw new Error("AI did not return an array of suggestions.");

                                // Format the output into a clean, readable blockquote
                                let suggestionsHtml = alternatives.map(alt =>
                                    `<h4>${App.util.escapeHtml(alt.tone)}</h4>
                                <p>${App.util.escapeHtml(alt.text)}</p>`
                                ).join('<hr style="border-top: 1px solid var(--border-color); margin: 0.5em 0;">');

                                const finalHtml = `
                                <blockquote contenteditable="false" style="margin-top: 1em;">
                                    <h4 style="font-weight: 600;">Original Text</h4>
                                    <p><em>${App.util.escapeHtml(selectedText)}</em></p>
                                    <hr style="border-top: 2px solid var(--border-color); margin: 1em 0;">
                                    ${suggestionsHtml}
                                </blockquote>
                                <p><br></p>`;

                                // Collapse the selection to the end and insert the HTML after it
                                selection.collapseToEnd();
                                document.execCommand('insertHTML', false, finalHtml);

                                App.ui.showToast("Writing suggestions generated!", 'success');
                                App.state.isArticleDirty = true;

                            } catch (error) {
                                console.error("KashWriting Error:", error, "AI Response:", result);
                                App.ui.showToast("AI returned an invalid format for suggestions.", "error");
                            }
                        } else {
                            App.ui.showToast("AI could not generate suggestions.", "warning");
                        }
                    },
                    async executeKashListify() {
                        const selection = window.getSelection();
                        const selectedText = selection.toString().trim();
                        if (!selectedText) {
                            App.ui.showToast("Please select text to convert to a list.", "warning");
                            return;
                        }

                        const systemPrompt = "Analyze the following text. Identify the main distinct points and restructure them as a concise markdown bulleted list. Respond ONLY with the markdown list, with each item on a new line starting with `* `.";
                        const result = await App.services.ai.queryGenerativeAI(systemPrompt, selectedText);

                        if (result && result.trim()) {
                            const listItems = result.trim().split('\n').map(line => {
                                const cleanLine = line.replace(/^\s*[\*\-]\s*/, '').trim();
                                return `<li>${App.util.escapeHtml(cleanLine)}</li>`;
                            }).join('');
                            const listHtml = `<ul>${listItems}</ul><p><br></p>`;
                            document.execCommand('insertHTML', false, listHtml);
                            App.ui.showToast("Text converted to list!", 'success');
                            App.state.isArticleDirty = true;
                        } else {
                            App.ui.showToast("AI could not create a list from the selected text.", "warning");
                        }
                    },

                    async executeKashTimeline() {
                        const contentDiv = document.getElementById('article-content');
                        if (!contentDiv || !contentDiv.textContent.trim()) {
                            App.ui.showToast("The article is empty. Add some content to create a timeline from.", "warning");
                            return;
                        }

                        const articleContent = contentDiv.innerText;
                        const toastId = App.ui.showToast('🤖 AI is synthesizing your timeline...', { type: 'info', duration: 0 });

                        const systemPrompt = `You are 'Kash, the Chronicler,' an expert AI historian and Data Visualizer and TimeLine Maker. Your mission is to analyze an article and extract the most important information as a structured list of timeline events.

                        **Your Core Directive:**
                        1.  **Act as an Expert:** Use your own knowledge as a subject matter expert on the topic to understand the key sequence of events, concepts, or stages within the user's [Article Content].
                        2.  **Extract Data:** Identify the 5-16 most critical points and extract the data for each point into a pair of values: a "date" and a "title".
                            * The "date" can be an actual date (e.g., "1978"), a concept (e.g., "Article 20"), or a stage (e.g., "Step 1"). So Date changes according to Article content and use your Creativity to break Article down into Steps (which can be anything from Articles in polity to Questions). "Date" could be questionslike "why","who","when","how" etc. 
                            * The "title" is the description of the event or concept or explanation or example or detail etc..
                            * So you can be creative to embedd the most rigid information in the form of structured Timeline. Innovation is key to success and you have to innovate if content doesnt follow any structure, to put it in structure , use your all ability and knowledge to make a revision timeline.

                        **Strict Output Format (CRITICAL):**
                        Your entire response MUST be a single, valid JSON array of objects. Each object must have exactly two keys: "date" (which can even not be a date got it?) and "title".

                        **Example Response:**
                        [ {"date": "1978", "title": "The landmark Maneka Gandhi vs. Union of India case significantly broadened the scope of Article 21."},
                        {"date": "Article 20", "title": "Provides safeguards against arbitrary and excessive punishment, including protections against ex post facto laws, double jeopardy, and self-incrimination."},
                        {"date": "Article 21", "title": "Guarantees the protection of life and personal liberty, which the Supreme Court has interpreted to include the right to live with dignity and privacy."},
                        {"date": "What is life", "title":"Biology is the scientific study of life and living organisms, encompassing their structure, function, growth, origin, evolution, and distribution"}, 
                        ]`;

                        const result = await App.services.ai.queryGenerativeAI(systemPrompt, articleContent);
                        App.ui.hideToast(toastId);

                        if (result && result.trim()) {
                            try {
                                // Find the JSON array within the AI's response
                                const jsonMatch = result.match(/\[\s*\{[\s\S]*?\}\s*\]/s);
                                if (!jsonMatch) throw new Error("AI response did not contain a valid JSON array.");

                                const timelineData = JSON.parse(jsonMatch[0]);
                                if (!Array.isArray(timelineData) || timelineData.length === 0) {
                                    throw new Error("AI did not return any timeline entries.");
                                }

                                const timelineEntriesHTML = timelineData.map(entry => {
                                    if (!entry.date || !entry.title) return ''; // Skip invalid entries
                                    const cleanDate = App.util.escapeHtml(entry.date);
                                    const cleanTitle = App.util.escapeHtml(entry.title);
                                    return `
                                    <div class="nk-timeline-entry">
                                        <div class="nk-timeline-content">
                                            <div class="nk-timeline-date" contenteditable="true">${cleanDate}</div>
                                            <div class="nk-timeline-title" contenteditable="true">${cleanTitle}</div>
                                        </div>
                                    </div>
                                `;
                                }).join('');

                                if (!timelineEntriesHTML) throw new Error("Generated timeline data was empty or invalid.");

                                const separatorHtml = `<hr style="border: none; border-top: 3px dashed var(--border-color); opacity: 0.6; width: 80%; margin: 2rem auto;">
                                            <div style="text-align: center; font-family: var(--font-body); font-weight: 600; color: var(--text-secondary); margin-bottom: 1rem;">
                                                ⏳ NoteKash AI Timeline ✨
                                            </div>`;

                                const finalTimelineHtml = `
                                <div class="nk-timeline-block" contenteditable="false">
                                    ${timelineEntriesHTML}
                                </div>`;


                                contentDiv.insertAdjacentHTML('beforeend', separatorHtml + finalTimelineHtml + '<p><br></p>');

                                const newTimeline = contentDiv.querySelector('.nk-timeline-block:last-of-type');
                                if (newTimeline) {
                                    newTimeline.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }

                                App.ui.showToast("AI-generated timeline inserted!", 'success');
                                App.state.isArticleDirty = true;

                            } catch (error) {
                                App.ui.showToast("AI could not generate a valid timeline from the text.", "warning");
                                console.error("Timeline Generation Failed:", error, "AI Response:", result);
                            }
                        } else {
                            App.ui.showToast("AI returned an empty response.", "warning");
                        }
                    },

                    async executeKashOutline(topic) {
                        if (!topic) {
                            App.ui.showToast("Please provide a topic for the outline.", "warning");
                            return;
                        }

                        const systemPrompt = "You are an expert academic planner with expertise in given Topic. Generate a structured and hierarchical outline for the given Topic. The outline should be detailed, with main points and several sub-points for each. Use nested HTML unordered lists (<ul> and <li>). Respond ONLY with the complete HTML list structure, without any surrounding text or markdown fences.";

                        const result = await App.services.ai.queryGenerativeAI(systemPrompt, topic);

                        if (result && result.trim().startsWith('<ul>')) {
                            const outlineHtml = result.trim() + '<p><br></p>';
                            document.execCommand('insertHTML', false, outlineHtml);
                            App.ui.showToast(`Outline for "${topic}" generated!`, 'success');
                            App.state.isArticleDirty = true;
                        } else {
                            App.ui.showToast("AI could not generate an outline for this topic.", "warning");
                        }
                    },

                    async executeKashExpand() {
                        const selection = window.getSelection();
                        if (!selection || selection.rangeCount === 0) {
                            App.ui.showToast("Place your cursor where you want the AI to continue writing.", "warning");
                            return;
                        }

                        const range = selection.getRangeAt(0);
                        const container = range.startContainer;

                        // Find the parent block element (p, li, h1, etc.) to get the full context. This part remains the same.
                        const parentBlock = (container.nodeType === 3 ? container.parentElement : container).closest('p, li, h1, h2, h3, h4, h5, h6, blockquote, div');

                        if (!parentBlock || !document.getElementById('article-content').contains(parentBlock)) {
                            App.ui.showToast("AI can only continue writing within a text block.", "warning");
                            return;
                        }

                        const contextRange = document.createRange();
                        contextRange.setStart(parentBlock, 0);
                        contextRange.setEnd(range.startContainer, range.startOffset);
                        const contextText = contextRange.toString();


                        if (contextText.trim() === '') {
                            App.ui.showToast("There isn't enough context for the AI to continue. Please write something first.", "warning");
                            return;
                        }

                        const systemPrompt = `You are an intelligent writing assistant who completely understands and has expertise in subject matter the user is writing about. The user has provided text they have written so far. Your task is to seamlessly continue writing from where they left off.
                    - If the user stopped mid-sentence, complete that sentence naturally and then write 3 more related sentences.
                    - If the user stopped at the end of a sentence, write 4 new sentences that logically follow.
                    - Maintain the original tone, style, and topic of the provided text.
                    - Respond ONLY with the newly generated text. Do not repeat the user's original text in your response.`;

                        const result = await App.services.ai.queryGenerativeAI(systemPrompt, contextText);

                        if (result && result.trim()) {
                            const generatedText = " " + result.trim();

                            // Use the original live range to insert the AI's response at the cursor
                            range.insertNode(document.createTextNode(generatedText));

                            range.setStartAfter(range.endContainer);
                            range.collapse(true);
                            selection.removeAllRanges();
                            selection.addRange(range);

                            App.ui.showToast("AI continued writing!", 'success');
                            App.state.isArticleDirty = true;
                        } else {
                            App.ui.showToast("The AI couldn't think of what to write next. Please try again.", "warning");
                        }
                    },
                    async executeKashQuote() {
                        const contentDiv = document.getElementById('article-content');
                        if (!contentDiv || !contentDiv.textContent.trim()) {
                            App.ui.showToast("Your note is empty. Add some content for the AI to analyze.", "warning");
                            return;
                        }
                        const userPrompt = contentDiv.innerText;

                        const systemPrompt = `You are 'Kash, the Quote Master,' an AI expert with the combined knowledge of a historian, a philosopher, and a literary scholar. Your sole purpose is to analyze a user's text and find the single most insightful and contextually relevant quote to enhance their writing. You must adhere to a strict process and output format.

                        **Your Thought Process (Follow these steps internally):**

                        1.  **Thematic Distillation:** First, read the entire article content to distill its core theme, central argument, and overall tone. Are you reading a critical analysis of a government policy, a philosophical reflection on learning, or a historical account of an event?

                        2.  **Conceptual Extraction:** Second, based on the theme, identify 3-5 key concepts, nouns, or abstract ideas that are central to the text (e.g., 'judicial independence', 'bureaucracy', 'economic reform', 'the nature of memory', 'creative struggle').

                        3.  **Intelligent Search & Selection:** Third, search your vast internal library of quotations. Your goal is to find a quote that doesn't just match a keyword, but one that **resonates with the underlying argument, tension, or situation** described in the text.
                            * **Prioritize insight over fame:** A lesser-known but perfectly relevant quote is far better than a famous but generic one.
                            * The best quote is one that offers a profound summary, a sharp counterpoint, a piece of timeless wisdom, or a witty perspective on the article's specific theme.

                        **Strict Output Format:**

                        After completing your internal thought process, you MUST respond ONLY with a single, valid JSON object containing the quote and the author.

                        * The JSON object must have two keys: "quote" and "author".
                        * Do NOT include any explanations, greetings, conversational text, or markdown formatting. Your entire response must be just the JSON object.

                        **Example Response Format:**
                        {"quote": "The art of writing is the art of discovering what you believe.", "author": "Gustave Flaubert"}`;

                        const result = await App.services.ai.queryGenerativeAI(systemPrompt, userPrompt);

                        if (result && result.trim()) {
                            try {
                                const jsonMatch = result.match(/\{\s*"quote"[\s\S]*?\}/s);
                                if (!jsonMatch) throw new Error("AI response did not contain a valid JSON object.");

                                const parsedQuote = JSON.parse(jsonMatch[0]);

                                if (!parsedQuote.quote || !parsedQuote.author) {
                                    throw new Error("JSON response is missing 'quote' or 'author' key.");
                                }
                                const quoteHtml = `
                                <blockquote contenteditable="false" style="margin: 1.5em 0; border-left: 3px solid var(--primary-color); padding-left: 1.5em; font-style: italic;">
                                    <p style="font-size: 1.1em; line-height: 1.6;">${App.util.escapeHtml(parsedQuote.quote)}</p>
                                    <footer style="text-align: right; font-size: 1em; font-style: normal; color: var(--text-secondary); margin-top: 0.5em;">— ${App.util.escapeHtml(parsedQuote.author)}</footer>
                                </blockquote>`;

                                App.util.insertGuardianBlock(quoteHtml); // Use our helper for clean insertion
                                App.ui.showToast("Contextual quote inserted!", 'success');
                                App.state.isArticleDirty = true;

                            } catch (error) {
                                console.error("KashQuote Error:", error, "AI Response:", result);
                                App.ui.showToast("AI returned an invalid format for the quote.", "error");
                            }
                        } else {
                            App.ui.showToast("The AI couldn't find a suitable quote. Please try again.", "warning");
                        }
                    },

                    async executeKashExtract(subCommand) {
                        const contentDiv = document.getElementById('article-content');
                        if (!contentDiv || !contentDiv.textContent.trim()) {
                            App.ui.showToast("Your note is empty. Add some content for the AI to analyze.", "warning");
                            return;
                        }
                        const articleContent = contentDiv.innerText;

                        const systemPrompt = `You are 'KashExtractor', a hyper-intelligent research assistant embedded within the NoteKash app. Your entire universe of knowledge is strictly limited to the user-provided 'Article Content'. You will be given a [Sub-command] and the [Article Content]. Your task is to follow the logic below precisely and respond ONLY with a single, complete HTML block.

                        **Core Logic Flow:**

                        1.  **IF the [Sub-command] is 'default', empty, or just whitespace:**
                            * Provide a single, dense paragraph that summarizes the core thesis and main points of the article.
                            * **HTML Output:** Wrap this summary in \`<p>...\</p>\`.

                        2.  **ELSE IF the [Sub-command] is a structured request ('dates', 'names', 'stats', 'acronyms', 'laws', 'arguments'):**
                            * Scour the [Article Content] for the requested data type.
                            * For each item found, provide a brief, context-aware description based **only** on the information present in the article.
                            * **HTML Output:** Format the entire response as a single HTML unordered list \`<ul>\`. Each item must be \`<li><b>[Extracted Item]:</b> [Contextual description from article]</li>\`.

                        3.  **ELSE (treat any other [Sub-command] as a Natural Language Query):**
                            * This is your most important task. Follow this two-step process meticulously:
                            * **Step A: Internal Search.** First, you MUST scour the [Article Content] to find a direct answer to the user's query.
                            * **Step B: Formulate Response.**
                                * **If an answer is found:** Your response MUST begin with the exact phrase "<strong>From the Article: </strong>". Then, provide the answer, quoting the relevant part if possible.
                                * **If NO answer is found:** Your response MUST begin with the exact phrase "<strong>Not in Article: </strong>". Put this in braces. Then, you may use your general knowledge to provide a brief answer, prefacing it with "However, according to reliable sources...".
                            * **HTML Output:** Format your response as a simple \`<p>...\</p>\` or \`<blockquote>...</blockquote>\`.

                        **CRITICAL FINAL RULES:**
                        * Your ENTIRE response must be ONLY the generated HTML content.
                        * Do NOT include \`\`\`html\` or any other markdown fences.
                        * Do NOT include any conversational text, greetings, or explanations outside of the required HTML.
                        * If the article is empty or irrelevant to the query, simply respond with \`<p>The article does not contain enough information to answer this query.</p>\`.`;

                        const result = await App.services.ai.queryGenerativeAI(systemPrompt, `[Sub-command]: ${subCommand}\n\n[Article Content]:\n${articleContent}`);

                        if (result && result.trim()) {
                            const cleanedHtml = result.trim().replace(/^```(html)?\n?/, '').replace(/\n?```$/, '');

                            const titleText = subCommand === 'default' ? 'Article Summary' : `Extraction: "${subCommand}"`;

                            const finalHtml = `
                            <div class="nk-text-tile color-ghost-2" contenteditable="true" data-color="ghost-2">
                                <div class="nk-text-tile-content" contenteditable="true" style="white-space: normal;">
                                    <h4 style="margin-top: 0; font-weight: 600;" contenteditable="false">${App.util.escapeHtml(titleText)}</h4>
                                    ${cleanedHtml}
                                </div>
                            </div>`;

                            App.util.insertGuardianBlock(finalHtml);
                            App.ui.showToast("Extraction complete!", 'success');
                            App.state.isArticleDirty = true;
                        } else {
                            App.ui.showToast("The AI could not extract the requested information.", "warning");
                        }
                    },

                    async executeKashLink(topic) {
                        if (!topic) {
                            App.ui.showToast("Please provide a topic to create and link.", "warning");
                            return;
                        }

                        const contentDiv = document.getElementById('article-content');
                        const existingNoteContext = (contentDiv && contentDiv.textContent.trim())
                            ? contentDiv.innerText
                            : "The user's current note is empty.";

                        const generationToast = App.ui.showToast(`🤖 AI is writing about "${topic}"...`, { type: 'info', duration: 0 });

                        const generationPrompt = `You are a distinguished academic writer and subject matter expert. Your goal is to create a new, linked note for the user that is contextually aware of what they are already writing. Your new written note should be factually accurate and reliable.

                        **You will be given two inputs:**
                        1.  **[Existing Note Context]:** The text from the note the user is currently writing.
                        2.  **[New Note Topic]:** The topic for the new note, which may include specific instructions.

                        **Your Primary Directive (A 3-Step Process):**

                        1.  **Analyze Context:** First, carefully read the [Existing Note Context] to understand its main theme, arguments, and the specific facts already mentioned.

                        2.  **Analyze Intent:** Second, analyze the [New Note Topic] string.
                            * **If it contains specific instructions** (e.g., 'create a table', 'list key points', 'short 2 tables on...'): Fulfill that request precisely and concisely. Your output should be exactly what the user asked for. For example, if the topic is "a short table on the Mauryan Kings," you MUST generate only a short HTML table and nothing else Similarly if user Request is "Long Table on Gupta Kings", you must generate a most exaustive and detailed table on all Gupta Kings.
                            * **If it's a general topic** (e.g., "The Ashokan Empire"): You will default to generating a comprehensive, well-structured introductory article. This default article MUST follow this structure:
                                1.  **Introduction:** A concise introductory paragraph most relevant to topic and have catchy words to attract users attention (hooks etc.).
                                2.  **Key Sections:** 2 to 5 distinct sections with \`<h2>\` catchy headings. Under those headings comprehsive content well-formatted.
                                3.  **Conclusion:** A summary paragraph for key-takeaways from content which you wrote.

                        3.  **Generate Context-Aware Content:** This is your most important task. When generating the content for the new note:
                            * **Tailor Relevance:** Focus on aspects of the [New Note Topic] that directly relate to or expand upon the [Existing Note Context].
                            * **DO NOT REPEAT:** You MUST AVOID repeating facts, definitions, or specific data points that are already present in the [Existing Note Context]. Your goal is to provide new, complementary information.

                        **Content & Formatting Rules (Apply to ALL responses):**
                        * Prioritize factual accuracy and reliability above everything else.
                        * Use a Neutral, Objective, Unbiased and Academic tone.
                        * Use clean HTML. Bold key terms with \`<b>\`. Use \`<ul>\` for lists and \`<table>\` for tables where appropriate (short tables should be used more often when possible, since they are good for presentation of content and revision).
                        * Respond ONLY with the required HTML content. Do NOT include \`<html>\`, \`<body>\`, markdown fences, or any conversational text.`;

                        const userPrompt = `[Existing Note Context]:\n${existingNoteContext}\n\n---\n\n[New Note Topic]:\n${topic}`;
                        const generatedContent = await App.services.ai.queryGenerativeAI(generationPrompt, userPrompt);

                        if (!generatedContent || !generatedContent.trim()) {
                            App.ui.hideToast(generationToast);
                            App.ui.showToast(`AI failed to generate content for "${topic}".`, "error");
                            return;
                        }

                        App.ui.updateToast(generationToast, `🧠 AI is categorizing the new note...`);
                        const userCategoryNames = App.settings.get('userCategories').map(c => c.name);
                        const categorizationPrompt = `You are an expert librarian AI. Your task is to categorize a given text into one of the following user-provided categories. Analyze the text and respond with ONLY the single most appropriate category name from the list.

                **Available Categories:**
                ${userCategoryNames.join(', ')}`;

                        const suggestedCategory = await App.services.ai.queryGenerativeAI(categorizationPrompt, generatedContent);
                        const finalCategory = (suggestedCategory && userCategoryNames.includes(suggestedCategory.trim()))
                            ? suggestedCategory.trim()
                            : (App.settings.get('userCategories').find(c => c.isDefault) || { name: 'General' }).name;

                        App.ui.updateToast(generationToast, `💾 Saving new note...`);
                        const newNoteTitle = topic.length > 100 ? topic.substring(0, 100) + '...' : topic;
                        const noteData = { title: newNoteTitle, content: generatedContent, category: finalCategory };
                        const newNote = await App.storage.createArticle(noteData);

                        if (!newNote) {
                            App.ui.hideToast(generationToast);
                            App.ui.showToast(`Failed to save the new note for "${topic}".`, "error");
                            return;
                        }

                        const linkHtml = `<a href="#" data-link-type="article" data-link-id="${newNote.id}">${App.util.escapeHtml(newNoteTitle)}</a>&nbsp;`;

                        App.util.restoreSelection();
                        document.execCommand('insertHTML', false, linkHtml);
                        App.state.isArticleDirty = true;

                        App.ui.hideToast(generationToast);
                        App.ui.showToast(`Created and linked new note: "${newNoteTitle}"!`, "success");
                    },


                    async executeKashSplit() {
                        const contentDiv = document.getElementById('article-content');
                        const originalArticle = App.storage.getArticle(App.state.activeArticleId);

                        if (!contentDiv || !originalArticle || !contentDiv.textContent.trim()) {
                            App.ui.showToast("Cannot split an empty or unsaved note.", "warning");
                            return;
                        }
                        const originalContent = contentDiv.innerHTML;

                        const splitToast = App.ui.showToast('🤖 AI is analyzing the best way to split your note...', { type: 'info', duration: 0 });

                        const splitPrompt = `You are an expert AI editor and content strategist named 'KashSplit'. Your sole purpose is to intelligently split a single long article into two shorter, thematically coherent, and self-contained notes.

                        **Your 4-Step Thought Process (Follow these steps internally):**

                        1.  **Full Comprehension:** First, read and fully comprehend the entire [Article Content] to understand its main narrative, key arguments, and overall structure.

                        2.  **Identify the Breakpoint:** Second, identify the single most logical and natural breakpoint in the article. This could be a transition between major topics, a chronological shift, or a move from a foundational concept to its applications. Do not simply split in the middle.

                        3.  **Rewrite & Refactor (Most Important Step):** Third, rewrite the content into two distinct parts.
                            * **Part 1:** This part must be a complete note. If you've split in the middle of a section, you MUST write a proper concluding sentence or paragraph for it.
                            * **Part 2:** This part must also be a complete note. You MUST write a proper introductory sentence or paragraph to provide context, as it will become a new, standalone note.
                            * **Preserve Everything:** You must not lose any facts, data, or key information from the original article. All content must be retained and correctly placed in either Part 1 or Part 2.
                            * **Strucute & Beautify:** While Refactoring content you can use <b>, <i>, and other formatting tools to beautify the content. Also CRITICALLY use TABLES for presentation and Revision, wherever possible.

                        4.  **Generate a New Title:** Fourth, create a new, concise, and descriptive title for the second part of the content. This title should accurately reflect the main topic of the new note.

                        **Strict Output Format (CRITICAL):**
                        Your response MUST be a single, valid JSON object. Do NOT include any other text, markdown, or explanations. The JSON object must have three keys:
                        1.  \`part1_html\`: A string containing the full, rewritten HTML content for the first note.
                        2.  \`part2_title\`: A string containing the new title for the second note.
                        3.  \`part2_html\`: A string containing the full, rewritten HTML content for the new, second note.`;

                        const result = await App.services.ai.queryGenerativeAI(splitPrompt, originalContent);

                        if (!result || !result.trim()) {
                            App.ui.hideToast(splitToast);
                            App.ui.showToast("AI could not split the note. Please try again.", "error");
                            return;
                        }

                        try {
                            const jsonMatch = result.match(/\{\s*"part1_html"[\s\S]*?\}/s);
                            if (!jsonMatch) throw new Error("AI response did not contain a valid JSON object.");
                            const splitData = JSON.parse(jsonMatch[0]);

                            if (!splitData.part1_html || !splitData.part2_title || !splitData.part2_html) {
                                throw new Error("JSON response is missing required keys.");
                            }

                            App.ui.updateToast(splitToast, `💾 Creating new note: "${splitData.part2_title}"...`);

                            // Create the second note
                            const newNote = await App.storage.createArticle({
                                title: splitData.part2_title,
                                content: splitData.part2_html,
                                category: originalArticle.category
                            });

                            if (!newNote) throw new Error("Failed to save the new split note.");

                            const linkHtml = `<p><br></p><blockquote><p><em>Continued in: <a href="#" data-link-type="article" data-link-id="${newNote.id}">${App.util.escapeHtml(newNote.title)}</a></em></p></blockquote>`;

                            const finalContentPart1 = splitData.part1_html + linkHtml;
                            const updateResult = await App.storage.updateArticle(originalArticle.id, {
                                title: originalArticle.title, // Keep original title
                                content: finalContentPart1
                            });

                            if (!updateResult.success) throw new Error("Failed to update the original note.");

                            App.ui.hideToast(splitToast);
                            App.ui.showToast("Note split successfully!", "success");
                            App.router.navigateTo('article', { id: originalArticle.id, mode: 'write' });


                        } catch (error) {
                            console.error("KashSplit Error:", error, "AI Response:", result);
                            App.ui.hideToast(splitToast);
                            App.ui.showToast("AI returned an invalid format. Could not split note.", "error");
                        }
                    },

                    async executeKashMcqGenerator() {
                        const contentDiv = document.getElementById('article-content');
                        if (!contentDiv || !contentDiv.textContent.trim()) {
                            App.ui.showToast("Your note is empty. Add some content first!", "warning");
                            return;
                        }

                        const toastId = App.ui.showToast('🤖 AI is crafting your questions...', { type: 'info', duration: 0 });
                        const articleContent = contentDiv.innerText;

                        const systemPrompt = `You are an expert educator and quiz designer integrated into the NoteKash app. Your task is to analyze the provided [Article Content] and, by synthesizing it with your own expert knowledge, create a set of 4 to 9 high-quality Multiple-Choice Questions (MCQs).

                    **Core Directives:**
                    1.  The questions must test deep comprehension of the material, not just surface-level facts.
                    2.  You must create plausible distractors (incorrect options) that are related to the topic but clearly wrong.
                    3.  Each question must have exactly one correct answer.
                    4.  The content should be a mix of information directly from the text and related concepts from your own knowledge base.

                    **Randomization Rule (CRITICAL):**
                    You MUST randomly distribute the position of the correct answer. The \`correct_index\` should have an equal chance of being 0, 1, 2, or 3. Do not favor any specific position.

                    **CRITICAL OUTPUT FORMAT:**
                    Your ENTIRE response MUST be a single, valid JSON array of objects. Do NOT include any other text, markdown, or explanations.
                    Each object in the array represents one MCQ and MUST have three keys:
                    1.  "question": A string containing the question text.
                    2.  "options": An array of 4 strings representing the choices.
                    3.  "correct_index": A number (0-based index) indicating which option in the "options" array is the correct one.

                    **Example JSON Response:**
                    [
                      {
                        "question": "According to the DPSP, what is the State's primary goal in India?",
                        "options": [
                          "To establish a military superpower.",
                          "To create a 'Welfare State' promoting social and economic justice.",
                          "To enforce Fundamental Rights exclusively.",
                          "To remain neutral in all social and economic matters."
                        ],
                        "correct_index": 1
                      }
                    ]`;

                        try {
                            const result = await App.services.ai.queryGenerativeAI(systemPrompt, articleContent);
                            App.ui.hideToast(toastId);

                            if (!result || !result.trim()) {
                                throw new Error("AI returned an empty response.");
                            }

                            const jsonMatch = result.match(/\`\`\`json\s*([\s\S]*?)\s*\`\`\`|(\[[\s\S]*\])/);
                            if (!jsonMatch) throw new Error("AI response did not contain a valid JSON array.");

                            const mcqs = JSON.parse(jsonMatch[1] || jsonMatch[2]);
                            if (!Array.isArray(mcqs) || mcqs.length === 0) {
                                throw new Error("Parsed data is not a valid array of MCQs.");
                            }

                            const mcqBlocksHTML = mcqs.map(mcq => {
                                if (!mcq.question || !mcq.options || mcq.correct_index === undefined) return '';

                                const optionsHTML = mcq.options.map((option, index) => {
                                    const isCorrect = index === mcq.correct_index;
                                    return `
                                    <div class="nk-mcq-option" data-is-correct="${isCorrect}">
                                        <div class="nk-mcq-option-radio"></div>
                                        <div class="nk-mcq-option-text" contenteditable="true">${App.util.escapeHtml(option)}</div>
                                        <button class="nk-mcq-delete-option" title="Delete Option">&times;</button>
                                    </div>
                                `;
                                }).join('');

                                return `
                                <div class="nk-mcq-block" contenteditable="false">
                                    <div class="nk-mcq-toolbar">
                                        <button class="nk-mcq-copy-block" title="Copy MCQ"><i class="fa-solid fa-copy"></i></button>
                                        <button class="nk-mcq-delete-block" title="Delete MCQ"><i class="fa-solid fa-trash"></i></button>
                                    </div>
                                    <div class="nk-mcq-question" contenteditable="true">${App.util.escapeHtml(mcq.question)}</div>
                                    <div class="nk-mcq-options">${optionsHTML}</div>
                                    <button class="btn btn-secondary nk-mcq-add-option">+ Add Option</button>
                                    <div class="nk-mcq-explanation" contenteditable="true" data-placeholder="Add answer explanation (optional)..."></div>
                                </div>`;
                            }).join('');

                            if (!mcqBlocksHTML.trim()) {
                                throw new Error("Failed to generate HTML from AI response.");
                            }

                            const separatorHtml = `
                            <hr style="border: none; border-top: 3px dashed var(--border-color); opacity: 0.6; width: 80%; margin: 2rem auto;">
                            <div style="text-align: center; font-family: var(--font-body); font-weight: 600; color: var(--text-secondary); margin-bottom: 1rem;">
                                🧠 AI Generated MCQs ✨
                            </div>`;

                            contentDiv.insertAdjacentHTML('beforeend', separatorHtml + mcqBlocksHTML + '<p><br></p>');
                            App.ui.showToast(`${mcqs.length} MCQs generated!`, 'success');
                            App.state.isArticleDirty = true;

                            // Scroll to the new content
                            const finalElement = contentDiv.lastElementChild;
                            if (finalElement) {
                                finalElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }

                        } catch (error) {
                            App.ui.hideToast(toastId);
                            App.ui.showToast(`AI failed: ${error.message}`, "error");
                            console.error("KashMCQ Generation Error:", error);
                        }
                    },

                    async executeKashMcqReviser() {
                        const selection = window.getSelection();
                        const selectedText = selection.toString().trim();

                        if (!selectedText) {
                            App.ui.showToast("Please select the MCQs you want to revise.", "warning");
                            return;
                        }

                        const toastId = App.ui.showToast('🎨 AI is revising and coloring your MCQs...', { type: 'info', duration: 0 });

                        const systemPrompt = `You are an Expert Educator and MCQ specialist for NoteKash. Your task is to REVISE and ENHANCE a set of raw Multiple Choice Questions (MCQs) provided by the user.

                        **Input:** A text containing one or more MCQs. They might have answers/explanations or just be raw text.

                        **Your Mission:**
                        1.  **Parse & Identify:** Identify each distinct MCQ in the text.
                        2.  **Solve & Verify:** Determine the correct answer. If an answer/explanation is already provided, verify it. If not, solve it yourself.
                        3.  **Enhance Question (IMPORTANT):** Retain the full question text but use avaialable formatting tools to present important keywrods in it well (e.g B/I/U and Text-Colors as well shown below).
                        4.  **Enhance Concise Explanation (CRITICAL):** Write a **concise**, very short, well-structured explanation, with no bluff (i.e directly tries to answer).
                            *   **Mandatory Formatting:** You MUST use these colors and formatting options (Bold/italics) for  important keywords/terms and points (etc.) to make explanations memorizable and beautiful.
                                *  Available text color options to you are "text-red, text-blue, text-green, text-teal, text-orange, text-slate, text-magenta". Use as many of Text coloring option in classes as possible to make it colorful. 
                                *  e.g <span class="text-magenta"><b>Kaktiya dynasty</b></span> 
                                *  Use different colors according to your choice to span differnet important points in explanation to make it colorful.
                        5.  **Format:** Return the data in the specific JSON format NoteKash requires.

                        **CRITICAL OUTPUT FORMAT:**
                        Your ENTIRE response MUST be a single, valid JSON array of objects. Do NOT include any other text.
                        [
                        {
                            "question": "The formatted question HTML string...",
                            "options": ["Option A", "Option B", "Option C", "Option D"],
                            "correct_index": 0, // 0-based index of correct option
                            "explanation": "The formatted explanation HTML string here..."
                        }
                        ]`;

                        try {
                            const result = await App.services.ai.queryGenerativeAI(systemPrompt, selectedText);
                            App.ui.hideToast(toastId);

                            if (!result || !result.trim()) throw new Error("AI returned an empty response.");

                            const jsonMatch = result.match(/\`\`\`json\s*([\s\S]*?)\s*\`\`\`|(\[[\s\S]*\])/);
                            if (!jsonMatch) throw new Error("AI response did not contain a valid JSON array.");

                            const mcqs = JSON.parse(jsonMatch[1] || jsonMatch[2]);
                            if (!Array.isArray(mcqs) || mcqs.length === 0) throw new Error("Parsed data is not a valid array of MCQs.");

                            const mcqBlocksHTML = mcqs.map(mcq => {
                                if (!mcq.question || !mcq.options || mcq.correct_index === undefined) return '';

                                const optionsHTML = mcq.options.map((option, index) => {
                                    const isCorrect = index === mcq.correct_index;
                                    return `
                                    <div class="nk-mcq-option" data-is-correct="${isCorrect}">
                                        <div class="nk-mcq-option-radio"></div>
                                        <div class="nk-mcq-option-text" contenteditable="true">${App.util.escapeHtml(option)}</div>
                                        <button class="nk-mcq-delete-option" title="Delete Option">&times;</button>
                                    </div>
                                `;
                                }).join('');

                                const explanationHtml = mcq.explanation ? mcq.explanation : '';

                                // Question is now TRUSTED HTML from AI to allow formatting
                                const questionHtml = mcq.question;

                                return `
                                <div class="nk-mcq-block" contenteditable="false">
                                    <div class="nk-mcq-toolbar">
                                        <button class="nk-mcq-copy-block" title="Copy MCQ"><i class="fa-solid fa-copy"></i></button>
                                        <button class="nk-mcq-delete-block" title="Delete MCQ"><i class="fa-solid fa-trash"></i></button>
                                    </div>
                                    <div class="nk-mcq-question" contenteditable="true">${questionHtml}</div>
                                    <div class="nk-mcq-options">${optionsHTML}</div>
                                    <button class="btn btn-secondary nk-mcq-add-option">+ Add Option</button>
                                    <div class="nk-mcq-explanation" contenteditable="true" data-placeholder="Add answer explanation (optional)...">${explanationHtml}</div>
                                </div>`;
                            }).join('');

                            if (!mcqBlocksHTML.trim()) throw new Error("Failed to generate HTML from AI response.");

                            document.execCommand('insertHTML', false, mcqBlocksHTML + '<p><br></p>');
                            App.ui.showToast(`${mcqs.length} MCQs revised and styled!`, 'success');
                            App.state.isArticleDirty = true;

                        } catch (error) {
                            App.ui.hideToast(toastId);
                            App.ui.showToast(`Revision failed: ${error.message}`, "error");
                            console.error("KashMCQ Reviser Error:", error);
                        }
                    },

                    async executeKashTemplate(templateRequest) {
                        App.ui.closeModal(); // Close the Template Hub
                        const toastId = App.ui.showToast('📄 Generating template...', { type: 'info', duration: 0 });

                        const contentDiv = document.getElementById('article-content');
                        if (!contentDiv) {
                            App.ui.hideToast(toastId);
                            App.ui.showToast("Please open a note first.", "error");
                            return;
                        }

                        const preDefinedTemplates = {
                            'cornell-notes': `
                            <table style="width:100%; border-collapse: collapse; border: 1px solid var(--border-color); border-radius: var(--border-radius); overflow: hidden;">
                                <thead style="background-color: var(--bg-tertiary);">
                                    <tr>
                                        <th style="width: 70%; padding: 1rem; text-align: left;">Main Notes</th>
                                        <th style="width: 30%; padding: 1rem; text-align: left; border-left: 1px solid var(--border-color);">Cues & Questions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style="padding: 1rem; border-right: 1px solid var(--border-color); vertical-align: top; height: 300px;" data-placeholder="Capture your notes during the lecture or meeting here..."><p><br></p></td>
                                        <td style="padding: 1rem; vertical-align: top;" data-placeholder="After, pull out key terms, questions, or main ideas here..."><p><br></p></td>
                                    </tr>
                                    <tr style="background-color: var(--bg-tertiary);">
                                        <td colspan="2" style="padding: 1rem; border-top: 1px solid var(--border-color); vertical-align: top;" data-placeholder="Finally, write a 1-2 sentence summary of the entire page..."><p><b>Summary:</b> </p></td>
                                    </tr>
                                </tbody>
                            </table>`,
                            'swot-analysis': `<h2>SWOT Analysis</h2><div class="nk-textile-deck" contenteditable="false"><div class="nk-text-tile color-10"><div class="nk-text-tile-content" contenteditable="true"><b>Strengths:</b> What do we do well internally?</div></div><div class="nk-text-tile color-4"><div class="nk-text-tile-content" contenteditable="true"><b>Weaknesses:</b> Where can we improve internally?</div></div><div class="nk-text-tile color-2"><div class="nk-text-tile-content" contenteditable="true"><b>Opportunities:</b> What are the external chances to grow?</div></div><div class="nk-text-tile color-8"><div class="nk-text-tile-content" contenteditable="true"><b>Threats:</b> What external factors could harm us?</div></div></div>`,
                            'meeting-agenda': `<h2>Meeting Agenda</h2><div class="nk-text-tile color-7"><div class="nk-text-tile-content"><b>Date:</b> ${new Date().toLocaleDateString()}</div></div><div class="nk-text-tile color-7"><div class="nk-text-tile-content"><b>Attendees:</b> </div></div><hr><h3>Topics for Discussion:</h3><div class="nk-checkbox-wrapper" data-checked="false"><span class="nk-checkbox-box"></span><span class="nk-checkbox-text">Topic 1...</span></div><div class="nk-checkbox-wrapper" data-checked="false"><span class="nk-checkbox-box"></span><span class="nk-checkbox-text">Topic 2...</span></div><h3>Action Items:</h3><ul><li><br></li></ul>`,
                            'daily-planner': `<h2>Daily Plan: ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h2><div class="nk-text-tile color-ghost-1"><div class="nk-text-tile-content"><b>Top Priority for Today:</b> </div></div><h3>To-Do List:</h3><div class="nk-checkbox-wrapper" data-checked="false"><span class="nk-checkbox-box"></span><span class="nk-checkbox-text">Task 1...</span></div><div class="nk-checkbox-wrapper" data-checked="false"><span class="nk-checkbox-box"></span><span class="nk-checkbox-text">Task 2...</span></div><div class="nk-checkbox-wrapper" data-checked="false"><span class="nk-checkbox-box"></span><span class="nk-checkbox-text">Task 3...</span></div><h3>Notes:</h3><p><br></p>`,
                            'smart-goals': `<h2>SMART Goal Setting</h2><div class="nk-text-tile color-ghost-1"><div class="nk-text-tile-content"><b>Goal:</b> </div></div><hr><div class="nk-accordion" data-state="open"><div class="nk-accordion-trigger"><span class="nk-accordion-title"><b>(S)pecific</b></span></div><div class="nk-accordion-content" data-placeholder="What exactly do I want to achieve?"><p><br></p></div></div><div class="nk-accordion" data-state="closed"><div class="nk-accordion-trigger"><span class="nk-accordion-title"><b>(M)easurable</b></span></div><div class="nk-accordion-content" data-placeholder="How will I know when I have achieved it?"><p><br></p></div></div><div class="nk-accordion" data-state="closed"><div class="nk-accordion-trigger"><span class="nk-accordion-title"><b>(A)chievable</b></span></div><div class="nk-accordion-content" data-placeholder="Is this goal realistic with my current resources?"><p><br></p></div></div><div class="nk-accordion" data-state="closed"><div class="nk-accordion-trigger"><span class="nk-accordion-title"><b>(R)elevant</b></span></div><div class="nk-accordion-content" data-placeholder="Why is this goal important to me right now?"><p><br></p></div></div><div class="nk-accordion" data-state="closed"><div class="nk-accordion-trigger"><span class="nk-accordion-title"><b>(T)ime-bound</b></span></div><div class="nk-accordion-content" data-placeholder="What is the deadline for this goal?"><p><br></p></div></div>`,
                            'kwl-chart': `<h2>KWL Chart</h2><table style="width:100%;"><thead><tr><th>What I Know</th><th>What I Want to Know</th><th>What I Learned</th></tr></thead><tbody><tr><td data-placeholder="List prior knowledge..."><p><br></p></td><td data-placeholder="List questions..."><p><br></p></td><td data-placeholder="List new learnings..."><p><br></p></td></tr></tbody></table>`,
                            'pros-cons': `<h2>Pros & Cons: Decision Matrix</h2><div class="nk-text-tile color-7"><div class="nk-text-tile-content"><b>Decision to make:</b> </div></div><table style="width:100%;"><thead><tr><th style="background-color: color-mix(in srgb, var(--success-color) 10%, transparent);">Pros (Arguments For)</th><th style="background-color: color-mix(in srgb, var(--danger-color) 10%, transparent);">Cons (Arguments Against)</th></tr></thead><tbody><tr><td data-placeholder="List advantages..."><p><br></p></td><td data-placeholder="List disadvantages..."><p><br></p></td></tr></tbody></table>`,
                            'content-planner': `<h2>Content Planner</h2><div class="nk-textile-deck layout-stack" contenteditable="false"><div class="nk-text-tile color-5"><div class="nk-text-tile-content" contenteditable="true"><b>Ideas 💡:</b> </div></div><div class="nk-text-tile color-6"><div class="nk-text-tile-content" contenteditable="true"><b>In Progress ✍️:</b> </div></div><div class="nk-text-tile color-10"><div class="nk-text-tile-content" contenteditable="true"><b>Published ✅:</b> </div></div></div>`,

                            // --- NEW BEAUTIFUL VOCAB CARD ---
                            'vocab-card': `
                            <div class="nk-text-tile color-ghost-1" data-color="ghost-1" style="display: block; width: 100%;">
                                <div class="nk-text-tile-content" style="width: 100%;">
                                    <h2 contenteditable="true" style="margin-top:0; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;" data-placeholder="Enter Word..."></h2>
                                    <p><b>Meaning:</b></p>
                                    <blockquote contenteditable="true" data-placeholder="Enter the definition here..."><p><br></p></blockquote>
                                    <p><b>Example Sentence:</b></p>
                                    <blockquote contenteditable="true" data-placeholder="Use the word in a sentence..."><p><br></p></blockquote>
                                    <table style="width:100%; margin-top: 1rem;">
                                        <thead style="background-color: var(--bg-tertiary);">
                                            <tr>
                                                <th style="width:50%; text-align: left; padding: 0.5rem 1rem;">Synonyms</th>
                                                <th style="width:50%; text-align: left; padding: 0.5rem 1rem; border-left: 1px solid var(--border-color);">Antonyms</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td style="vertical-align: top; padding: 0.5rem 1rem;" data-placeholder="List synonyms..."><ul style="padding-left: 20px; margin-top: 0;"><li><br></li></ul></td>
                                                <td style="vertical-align: top; padding: 0.5rem 1rem; border-left: 1px solid var(--border-color);" data-placeholder="List antonyms..."><ul style="padding-left: 20px; margin-top: 0;"><li><br></li></ul></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>`,
                            'upsc-analysis': `<h2>Current Affairs Analysis</h2><div class="nk-textile-deck" contenteditable="false"><div class="nk-text-tile color-2"><div class="nk-text-tile-content" contenteditable="true"><b>Date:</b> ${new Date().toLocaleDateString()}</div></div><div class="nk-text-tile color-5"><div class="nk-text-tile-content" contenteditable="true"><b>Source:</b> The Hindu</div></div><div class="nk-text-tile color-9"><div class="nk-text-tile-content" contenteditable="true"><b>GS Paper:</b> GS-2</div></div></div><h3>Summary of the Issue</h3><blockquote data-placeholder="Write a concise summary of the news article or topic..."><p><br></p></blockquote><hr><h3>Analysis Matrix</h3><table style="width:100%;"><thead><tr><th>Key Arguments / Facts</th><th>Counterarguments / Nuances</th></tr></thead><tbody><tr><td data-placeholder="List the main points, data, and arguments presented..."><p><br></p></td><td data-placeholder="List opposing views, limitations, or alternative perspectives..."><p><br></p></td></tr></tbody></table><h3>Linkages with Static Syllabus</h3><ul data-placeholder="Connect this topic to the core UPSC syllabus..."><li><br></li></ul><h3>Practice Question</h3><blockquote data-placeholder="Formulate a Mains-style practice question based on this topic..."><p><br></p></blockquote>`
                        };

                        let templateHTML = '';

                        if (preDefinedTemplates[templateRequest]) {
                            templateHTML = preDefinedTemplates[templateRequest];
                        } else {
                            // This is a custom AI request, now locked for free users.
                            const systemPrompt = `You are a master productivity expert and document designer named 'KashTemplate'. Your purpose is to translate a user's request into a beautifully structured and aesthetically pleasing note template using NoteKash's native HTML components.

                        **CRITICAL RULES:**
                        1.  You MUST use ONLY the components listed in the 'Component Toolkit' below.
                        2.  You MUST NOT use form elements like \`<input>\`, \`<textarea>\`, or \`<label>\`. The entire template must be editable. Use stylized \`<div>\`s or table cells with placeholder text inside.
                        3.  Your response MUST BE ONLY the complete, clean HTML for the template. Do NOT include any other text, markdown, or explanations.

                        **Your Component Toolkit:**
                        * \`<table>\`: For structured data like schedules or comparison charts. Use \`<thead>\` and \`<th>\`.
                        * \`<div class="nk-textile-deck">\` with child \`<div class="nk-text-tile color-X">\`: For modular blocks of ideas. Use different colors (e.g., color-1 to color-10).
                        * \`<div class="nk-checkbox-wrapper">\`: For checklists and to-do lists.
                        * \`<div class="nk-accordion">\`: For Q&A sections or collapsible sections.
                        * Standard HTML: Use \`<h2>\`, \`<h3>\`, \`<blockquote>\`, \`<ul>\`, \`<hr>\` for clear hierarchy.

                        **Examples of Excellent NoteKash Templates (Learn From These):**

                        ---
                        **User Request:** "a swot analysis"
                        **Correct Output:**
                        \`\`\`html
                        <h2>SWOT Analysis</h2>
                        <div class="nk-textile-deck" contenteditable="false">
                            <div class="nk-text-tile color-10"><div class="nk-text-tile-content" contenteditable="true"><b>Strengths:</b></div></div>
                            <div class="nk-text-tile color-4"><div class="nk-text-tile-content" contenteditable="true"><b>Weaknesses:</b></div></div>
                            <div class="nk-text-tile color-2"><div class="nk-text-tile-content" contenteditable="true"><b>Opportunities:</b></div></div>
                            <div class="nk-text-tile color-8"><div class="nk-text-tile-content" contenteditable="true"><b>Threats:</b></div></div>
                        </div>
                        \`\`\`
                        ---
                        **User Request:** "a template for cornell notes"
                        **Correct Output:**
                        \`\`\`html
                        <table style="width:100%;">
                            <thead><tr><th>Main Notes</th><th>Cues & Questions</th></tr></thead>
                            <tbody>
                                <tr>
                                    <td data-placeholder="Capture notes..."><p><br></p></td>
                                    <td data-placeholder="Pull out key terms..."><p><br></p></td>
                                </tr>
                                <tr>
                                    <td colspan="2" data-placeholder="Write a summary..."><p><b>Summary:</b></p></td>
                                </tr>
                            </tbody>
                        </table>
                        \`\`\`
                        ---

                        **Your Task:** Now, generate a new template based on the user's latest request. Think visually and use a combination of components to create a template that is both functional and beautiful.`;

                            try {
                                const result = await App.services.ai.queryGenerativeAI(systemPrompt, templateRequest);
                                if (!result || !result.trim()) throw new Error("AI returned an empty response.");
                                templateHTML = result;
                            } catch (error) {
                                App.ui.hideToast(toastId);
                                App.ui.showToast(`AI failed to generate template: ${error.message}`, "error");
                                return;
                            }
                        }

                        const separatorHtml = `<hr style="border: none; border-top: 3px dashed var(--border-color); opacity: 0.6; width: 80%; margin: 2rem auto;">`;
                        contentDiv.insertAdjacentHTML('beforeend', separatorHtml + templateHTML + '<p><br></p>');

                        const finalElement = contentDiv.lastElementChild;
                        if (finalElement) {
                            finalElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }

                        App.ui.hideToast(toastId);
                        App.ui.showToast("Template inserted!", "success");
                        App.state.isArticleDirty = true;
                    },

                    async executeKashCraft() {
                        const contentDiv = document.getElementById('article-content');
                        if (!contentDiv || !contentDiv.textContent.trim()) {
                            App.ui.showToast("Your note is empty. Add some content to craft!", "warning");
                            return;
                        }

                        const toastId = App.ui.showToast('⛳️ KashCraft AI is analyzing your note...', { type: 'info', duration: 0 });
                        const articleContent = contentDiv.innerText;

                        const baseTemplate = `
                        <h2>Topic Title (AI will generate this)</h2>
                        <div class="nk-textile-deck" contenteditable="false">
                            <div class="nk-text-tile color-5" data-color="5"><div class="nk-text-tile-content" contenteditable="true"><b>Source:</b> </div></div>
                            <div class="nk-text-tile color-9" data-color="9"><div class="nk-text-tile-content" contenteditable="true"><b>Relevance:</b> </div></div>
                        </div>
                        <h3>📖 Context & Key Takeaways</h3>
                        <ul data-placeholder="AI will generate a bulleted list summarizing the key points..."><li_witt_br></li></ul>
                        <hr>
                        <h3>🔬 Deep Dive Analysis</h3>
                        <table style="width:100%;">
                            <thead>
                                <tr>
                                    <th style="background-color: color-mix(in srgb, var(--success-color) 10%, transparent);">Arguments For / Positives</th>
                                    <th style="background-color: color-mix(in srgb, var(--danger-color) 10%, transparent);">Challenges / Negatives</th>
                                </tr>
                            </thead>
                            <tbody><tr>
                                <td data-placeholder="List the main points, data, and arguments presented..."><p><br></p></td>
                                <td data-placeholder="List opposing views, limitations, or alternative perspectives..."><p><br></p></td>
                            </tr></tbody>
                        </table>
                        <h4>Way Forward:</h4>
                        <blockquote data-placeholder="AI will provide solution-oriented suggestions..."><p><br></p></blockquote>
                        <hr>
                        <h3>🔗 Connections & Context</h3>
                        <table style="width:100%;">
                            <thead><tr><th style="width:30%;">Foundational Topic</th><th>Linkage/Relevance</th></tr></thead>
                            <tbody><tr>
                                <td data-placeholder="e.g., Judicial Review"><p><br></p></td>
                                <td data-placeholder="Explain how the current topic impacts the foundational topic..."><p><br></p></td>
                            </tr></tbody>
                        </table>
                        <hr>
                        <h3>✍️ Practice Questions</h3>
                        <h4>Objective Question:</h4>
                        <div class="nk-mcq-block" contenteditable="false">
                            <div class="nk-mcq-question" contenteditable="true">AI will generate a relevant objective-style MCQ here.</div>
                        </div>
                        <h4>Descriptive Question:</h4>
                        <blockquote data-placeholder="AI will generate a descriptive, analytical question here..."><p><br></p></blockquote>
                        <hr>
                        <h3>🔑 Key Vocabulary</h3>
                        <div class="nk-textile-deck" contenteditable="false">
                            <div class="nk-text-tile color-7" data-color="7"><div class="nk-text-tile-content" contenteditable="true"><b>Term 1:</b> Definition...</div></div>
                        </div>
                        <hr>
                        <blockquote data-placeholder="AI will add a relevant, inspiring quote here..."></blockquote>
                    `;

                        // --- NEW, FINAL SUPERCHARGED SYSTEM PROMPT ---
                        const systemPrompt = `You are an elite mentor and content strategist named 'KashCraft'. Your mission is to transform a raw user-provided article into a gold-standard, in-depth analysis notes that is perfect to study for competitive exam aspirants (like UPSC) but is also universally useful for any deep learner. Your output must be natural to read and visually impressive (while making sure text is clearly visible and contrasting with background/blocks).

                    **Your Thought Process (Follow these steps meticulously):**

                    1.  **Analyze & Identify:** Read the entire [Article Content]. Identify the core topic and keywords and its broader subject (e.g., Polity, Economy, Science & Tech). For exam aspirants, you must internally map this to a specific syllabus paper, but the output label should be generic (e.g., 'Relevance: Polity & Governance').

                    2.  **Generate Metadata:** Create a new, appropriate \`<h2>\` title. Fill in the metadata textiles: Source, and Relevance.

                    3.  **Create "Context & Key Takeaways":**
                        * This is the most important Task and step which you should treat with utmost care and should consume 75% of all time you will take in Framing craftedArticle, Act as Elite Subject matter expert and Filter all information from Article through the "UPSC lens". Create  a bulleted list (\`<ul>\`) summarizing only what is relevant for exam. You should Summarize in-depth, the most critical, exam-relevant facts, keywords or points (e.g constitutional articles, SC judgments, key data, govt. schemes, names of committes, data points etc.).
                        * **CRITICAL FLOW RULE:** Each \`<li>\` item MUST be a complete, flowing sentence. Do NOT use bolded prefixes or headings like 'Background:' or 'Significance:' within the bullet points. The list should read like a natural paragraph of distinct points with <b> used for important keywords/numbers/dates and <em> for emphasis.

                    4.  **Fill "Deep Dive Analysis":** Populate the two-column table with positives vs. negatives after you have complete analysis of main arguments/facts of artcile. Then, write a brief, solution-oriented "Way Forward" in the blockquote.

                    5.  **Fill "Connections & Context":** Identify 1-3 foundational topics and explain the linkage in form of short table. Use few words possible and make it short.

                    6.  **Generate Practice Questions:** Create most relevant two questions to article of which - one objective question (prelims oriented) (using an \`nk-mcq-block\` ) and one descriptive question (mains oriented) (in a \`<div class="nk-text-tile color-3">\`).

                    7.  **Generate "Key Vocabulary":**
                        * Identify 3-5 of the most important technical terms from the article.
                        * **CRITICAL FORMATTING RULE:** For each term, create a separate \`<div class="nk-text-tile color-7">\`. The content inside MUST be formatted as \`<b>Term:</b> Definition...\`. Do NOT number them as 'Term 1', 'Term 2', etc. Wrap all tiles in a single \`<div class="nk-textile-deck">\`.

                    8.  **Find a Relevant Quote:** Conclude the entire crafted note with an most relevant Quote related to the Article which you writing (with author name too), placed within a \`<blockquote>\`.

                    9.  **Creative Freedom:** The template is a strong starting point, but you are an expert and not restricted to it. It just provides you way forward how to write but you can form your own template according to needs of craftedArticle. If the content requires it, you MUST add new sections or delete a section or use different NoteKash components (\`<div class="nk-timeline-block">\`, etc.) to best structure the information.

                    **CRITICAL OUTPUT FORMAT:**
                    * Your response MUST be the complete, well-structured, and aesthetically pleasing HTML of the final crafted note.
                    * Respond ONLY with the HTML. Do NOT include any other text, markdown, or explanations.`;

                        try {
                            const result = await App.services.ai.queryGenerativeAI(systemPrompt, `[Article Content]:\n${articleContent}\n\n[Base Template Reference]:\n${baseTemplate}`);
                            App.ui.hideToast(toastId);

                            if (!result || !result.trim()) { throw new Error("AI returned an empty response."); }

                            const separatorHtml = `
                            <hr style="border: none; border-top: 3px dashed var(--border-color); opacity: 0.6; width: 80%; margin: 2rem auto;">
                            <div style="text-align: center; font-family: var(--font-body); font-weight: 600; color: var(--text-secondary); margin-bottom: 1rem;">
                                ⛳️ KashCraft AI Version ✨
                            </div>`;

                            const finalHtml = `${result}`

                            contentDiv.insertAdjacentHTML('beforeend', separatorHtml + finalHtml + '<p><br></p>');
                            App.ui.showToast(`KashCraft analysis complete!`, 'success');
                            App.state.isArticleDirty = true;

                            const finalElement = contentDiv.lastElementChild;
                            if (finalElement) {
                                finalElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }

                        } catch (error) {
                            App.ui.hideToast(toastId);
                            App.ui.showToast(`AI failed: ${error.message}`, "error");
                            console.error("KashCraft Generation Error:", error);
                        }
                    },


                    async executeFixGrammar() {
                        const selection = window.getSelection();
                        const selectedText = selection.toString().trim();
                        if (!selectedText) {
                            App.ui.showToast("Please select text to fix and restructure.", "warning");
                            return;
                        }

                        const systemPrompt = `You are an expert editor and communication specialist. Your task is to perform two critical actions on the user's selected text:
                        1.  **Correct:** Meticulously fix all spelling mistakes, grammatical errors, vocabulary issue and punctuation issues.
                        2.  **Restructure for Clarity:** Rewrite the corrected text into logical, short, meaningful and easy-to-read paragraph.

                        **CRITICAL RULES:**
                        - You MUST preserve the original meaning and all information from the source text. Do not add or remove facts.
                        - Your response MUST BE ONLY the final, rewritten text formatted into clean HTML paragraph or paragraphs (if its too long).
                        - If selected text has few sentence make a logical paragaph, if it has many sentences you can write in paragraphs too according to what content demands.
                        - Your code will be used as replacement to selected text so, Do NOT include any conversational filler, explanations, or markdown code fences.`;

                        const toastId = App.ui.showToast('🤖 AI is improving your text...', { type: 'info', duration: 0 });
                        const result = await App.services.ai.queryGenerativeAI(systemPrompt, selectedText);
                        App.ui.hideToast(toastId);

                        if (result && result.trim()) {
                            const resultHtml = result.trim().replace(/^```(html)?\n?/, '').replace(/\n?```$/, '');

                            document.execCommand('insertHTML', false, resultHtml);
                            App.ui.showToast("Text fixed and restructured!", "success");
                            App.state.isArticleDirty = true;
                        } else {
                            App.ui.showToast("AI could not process the text. Please try again.", "warning");
                        }
                    },

                },

                spotlight: {
                    currentIndex: -1,
                    navigate(direction) {
                        const container = document.querySelector('.focus-mode-body');
                        if (!container) return;

                        const allItems = Array.from(container.querySelectorAll('.snippet, .nk-mcq-block, .nk-timeline-block, .chart-container, .nk-accordion'));

                        if (allItems.length === 0) return;

                        const currentFocus = document.querySelector('.spotlight-key-focus');
                        let currentIndex = -1;
                        if (currentFocus) {
                            currentIndex = allItems.indexOf(currentFocus);
                        }
                        let nextIndex;
                        if (currentIndex === -1) {
                            nextIndex = (direction === 1) ? 0 : allItems.length - 1;
                        } else {
                            nextIndex = currentIndex + direction;
                        }

                        nextIndex = Math.max(0, Math.min(allItems.length - 1, nextIndex));
                        const target = allItems[nextIndex];
                        if (target) {
                            container.querySelectorAll('.spotlight-key-focus').forEach(el => el.classList.remove('spotlight-key-focus'));
                            target.focus({ preventScroll: true });
                            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            target.classList.add('spotlight-key-focus');
                        }
                    },
                },



                handleSpotlight(event) {
                    if (!event.altKey) return;
                    const bodyEl = document.querySelector('.focus-mode-body');
                    if (!bodyEl || !bodyEl.classList.contains('spotlight-active')) return;

                    const targetSnippet = event.target.closest('.snippet, .nk-mcq-block');

                    if (event.type === 'mouseover' && targetSnippet) {
                        targetSnippet.classList.add('spotlight');
                    } else if (event.type === 'mouseout' && targetSnippet) {
                        targetSnippet.classList.remove('spotlight');
                    }
                },


                toggleFocusMode() {
                    App.state.isFullscreen = !App.state.isFullscreen;
                    const isFullscreen = App.state.isFullscreen;
                    document.body.classList.toggle('fullscreen-active', isFullscreen);
                    const floatingBtn = document.getElementById('focus-mode-toggle');
                    const controlsBtn = document.querySelector('.read-mode-controls [data-action="toggleFocusMode"]');
                    const isWrite = App.state.currentMode === 'write';

                    // NEW: Consistent Aesthetic Icons
                    const maximizeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2M12 9a3 3 0 100 6 3 3 0 000-6z" /></svg>`;
                    const minimizeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>`;

                    const newIcon = isFullscreen ? minimizeIcon : maximizeIcon;

                    if (floatingBtn) {
                        floatingBtn.classList.toggle('exit-active', isFullscreen);
                        floatingBtn.innerHTML = newIcon;
                    }
                    if (controlsBtn) {
                        controlsBtn.innerHTML = newIcon;
                    }

                    if (isFullscreen) {
                        App.ui.showToast('Immersive(f)', 'info');
                    } else {
                        // NEW: Auto-deactivate Pro Presenter when exiting fullscreen in Read Mode
                        if (document.body.classList.contains('is-pro-presenter-active')) {
                            this.presentation.toggleProPresenter();
                        }
                    }
                },
                enterProPresenterReadMode(articleId) {
                    if (!App.license.isPremium()) {
                        App.ui.showAscensionModal('proPresenter');
                        return;
                    }
                    if (!App.state.isFullscreen) {
                        this.toggleFocusMode();
                    }
                    if (!document.body.classList.contains('is-pro-presenter-active')) {
                        this.presentation.toggleProPresenter();
                    }
                },
                changeFontFamily(e) {
                    const newFont = e.target.value;

                    const freeFonts = [
                        'Arial, Helvetica, sans-serif',
                        "'Courier New', Courier, monospace",
                        'Garamond, serif',
                        'Georgia, serif',
                        'Helvetica, Arial, sans-serif',
                        'Monaco, "Lucida Console", monospace',
                        'Palatino, "Palatino Linotype", serif',
                        'Verdana, Geneva, sans-serif'
                    ];
                    const isPremium = !freeFonts.includes(newFont);

                    if (isPremium && !App.license.isPremium()) {
                        App.ui.showAscensionModal();
                        e.target.value = App.settings.get('fontFamily'); // Revert selection
                        return;
                    }

                    App.settings.set('fontFamily', newFont);
                    App.ui.applyFontSettings();
                },

                changeFontSize(e) {
                    const size = e.target.value;
                    document.documentElement.style.setProperty('--article-font-size', `${size}rem`);
                    document.getElementById('font-size-value').textContent = `${size}rem`;
                    App.settings.set('fontSize', `${size}rem`);
                },
                changeLineHeight(e) {
                    const lineHeight = e.target.value;
                    document.documentElement.style.setProperty('--article-line-height', lineHeight);
                    document.getElementById('line-height-value').textContent = lineHeight;
                    App.settings.set('lineHeight', lineHeight);
                },
                handleThemeChange(newTheme) {
                    const oldTheme = App.settings.get('theme');
                    if (newTheme === 'custom') {
                        if (!App.settings.get('backgroundImage')) this.triggerBgImageUpload(oldTheme);
                        else App.ui.applyTheme('custom');
                    } else App.ui.applyTheme(newTheme);
                    App.ui.updateSettingsUIState();
                },
                triggerBgImageUpload(oldTheme) {
                    const input = document.getElementById('background-image-input');
                    input.onchange = (event) => {
                        const file = event.target.files[0];
                        if (!file) { if (oldTheme) { document.getElementById('theme-select').value = oldTheme; App.events.handleThemeChange(oldTheme); } return; }
                        if (file.size > App.config.image.maxUploadSize) { App.ui.showToast(`Image too large. Max size is ${App.config.image.maxUploadSize / 1024 / 1024}MB.`, { type: 'error' }); return; }
                        const reader = new FileReader();
                        reader.onload = (re) => { App.settings.set('backgroundImage', re.target.result); App.ui.applyTheme('custom'); App.ui.updateSettingsUIState(); };
                        reader.readAsDataURL(file);
                    };
                    input.value = null;
                    input.click();
                },
                handleCustomThemeBaseChange(e) { App.settings.set('customThemeBase', e.target.value); if (App.settings.get('theme') === 'custom') App.ui.applyTheme('custom'); },
                changeUiOpacity(e) {
                    const opacity = e.target.value;
                    document.documentElement.style.setProperty('--ui-opacity', opacity);
                    document.getElementById('opacity-value').textContent = `${Math.round(opacity * 100)}%`;
                    App.settings.set('uiOpacity', opacity);
                    document.documentElement.style.setProperty('--blur-intensity', parseFloat(opacity) === 0 ? '0px' : '8px');
                    document.documentElement.classList.toggle('zero-opacity-active', parseFloat(opacity) === 0);
                },
                changeImageQuality(e) {
                    const quality = e.target.value;
                    document.getElementById('image-quality-value').textContent = `${Math.round(quality * 100)}%`;
                    App.settings.set('jpegQuality', parseFloat(quality));
                },

                changeOcrThreshold(e) {
                    const threshold = e.target.value;
                    const valueDisplay = document.getElementById('ocr-threshold-value');
                    if (valueDisplay) {
                        valueDisplay.textContent = threshold;
                    }
                    App.settings.set('ocrThreshold', parseInt(threshold, 10));
                },

                showTagModal(tag) {
                    const articlesWithTag = App.state.articles.filter(a => a.tags && a.tags.includes(tag)).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                    const tagDisplayName = App.state.tags[tag]?.displayName || tag;
                    const message = `<div class="tag-modal-body">
                    ${articlesWithTag.map(article => `
                        <div class="tag-modal-article-title" onclick="App.events.navigateToTagInArticle('${article.id}', '${tag}')">
                            <span>${article.title}</span>
                            <button class="btn-icon" title="Remove tag from this article" onclick="event.stopPropagation(); App.events.deleteTag('${tag}', '${article.id}')">${App.util.icons.trash}</button>
                        </div>`).join('') || '<p>No articles found for this tag.</p>'}
                </div>`;
                    App.ui.showConfirmationModal({
                        title: `Notes tagged with "${tagDisplayName}"`,
                        message: message,
                        showCancel: false,
                        confirmText: 'Close'
                    });
                },
                async deleteTag(tag, articleId) {
                    const article = App.storage.getArticle(articleId);
                    const tagDisplayName = App.state.tags[tag]?.displayName || tag;
                    if (!article || !article.tags.includes(tag)) return;

                    App.ui.showConfirmationModal({
                        title: `Remove Tag?`,
                        message: `Are you sure you want to remove the tag "${tagDisplayName}" from the article "${article.title}"? This will only remove the tag, not the text itself.`,
                        confirmText: 'Remove',
                        onConfirm: async () => {
                            const newTags = article.tags.filter(t => t !== tag);
                            let newContent = article.content;

                            const tempDiv = document.createElement('div');
                            tempDiv.innerHTML = newContent;
                            tempDiv.querySelectorAll(`.rendered-tag[data-tag-text="${tag}"], .rendered-tag[data-tag="${tag}"]`).forEach(el => App.util.unwrapNode(el));
                            newContent = tempDiv.innerHTML;

                            const result = await App.storage.updateArticle(articleId, { tags: newTags, content: newContent });
                            if (result.success) {
                                App.ui.showToast(`Tag "${tagDisplayName}" removed.`);
                                await App.contentTools.updateTagsIndex();
                                App.ui.closeModal();
                                App.events.showTagModal(tag);
                            }
                        }
                    });
                },
                navigateToTagInArticle(articleId, tag, shouldNavigate = true) {
                    const scrollToTaggedElement = () => {
                        const contentDiv = document.getElementById('article-content');
                        if (!contentDiv) return false;

                        const firstTaggedElement = contentDiv.querySelector(`[data-tag-text="${tag}"], [data-tag="${tag}"]`);
                        if (!firstTaggedElement) return false;

                        firstTaggedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        firstTaggedElement.style.transition = 'background-color 0.5s';
                        firstTaggedElement.style.backgroundColor = 'var(--hl-1-bg)';
                        setTimeout(() => { firstTaggedElement.style.backgroundColor = ''; }, 2000);
                        return true;
                    };

                    if (shouldNavigate) {
                        App.router.navigateTo('article', { id: articleId, mode: 'read' });
                        App.ui.closeModal();

                        // Article content mounts async; retry briefly until the element exists.
                        let attempts = 0;
                        const timer = setInterval(() => {
                            attempts++;
                            const done = scrollToTaggedElement();
                            if (done || attempts >= 15) clearInterval(timer);
                        }, 150);
                    } else {
                        scrollToTaggedElement();
                    }
                },
                changeCategorySort(e, category) { App.settings.set('categorySortBy', e.target.value); App.ui.renderCategoryView(document.getElementById('category-view'), category); },
                changeLibraryCategory(category) {
                    App.state.activeLibraryCategory = category;
                    const view = document.getElementById('library-view');
                    if (view) {
                        view.querySelectorAll('.category-filters .category-chip').forEach(btn => {
                            btn.classList.remove('active');
                        });
                        const activeBtn = view.querySelector(`.category-filters .category-chip[data-category="${category}"]`);
                        if (activeBtn) {
                            activeBtn.classList.add('active');
                        }
                    }
                    App.ui.filterAndRenderArticles();
                },
                changeSnippetCategory(category) {
                    const view = document.getElementById('category-view');
                    if (view) {
                        App.ui.renderCategoryView(view, category);
                        const currentState = history.state || {};
                        if (currentState.viewId === 'category') {
                            history.replaceState({ viewId: 'category', data: category }, '', '#category');
                        }
                    }
                },
                changeTagSort(e) { App.settings.set('tagSortBy', e.target.value); App.events.filterAndRenderTags(); },
                filterAndRenderTags() {
                    const sortBy = App.settings.get('tagSortBy');
                    const searchTerm = document.getElementById('tag-search-input')?.value.toLowerCase() || '';
                    const container = document.getElementById('tag-cloud-container');

                    if (!container) return;

                    let allTagsData = Object.values(App.state.tags);

                    if (searchTerm) {
                        allTagsData = allTagsData.filter(t => t.displayName.toLowerCase().includes(searchTerm));
                    }

                    let contentHtml;
                    if (allTagsData.length === 0) {
                        contentHtml = `<div class="empty-state"><svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg><h3>No Tags Found</h3><p>Create tags using [[double brackets]] in an article, or adjust your search.</p></div>`;
                    } else {
                        if (sortBy === 'random') allTagsData.sort(() => Math.random() - 0.5);
                        else if (sortBy === 'date-new') allTagsData.sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed));
                        else if (sortBy === 'date-old') allTagsData.sort((a, b) => new Date(a.firstUsed) - new Date(b.firstUsed));
                        else allTagsData.sort((a, b) => a.displayName.localeCompare(b.displayName));
                        contentHtml = `<div class="tag-cloud">${allTagsData.map(tagData => `<div class="tag-item" onclick="App.events.showTagModal('${tagData.id}')">${tagData.displayName}</div>`).join('')}</div>`;
                    }
                    container.innerHTML = contentHtml;
                },
                changeFlashcardCategory(category) {
                    App.settings.set('flashcardCategory', category);

                    // Correctly update the active button style using the '.active' class
                    const view = document.getElementById('flashcard-view');
                    if (view) {
                        // First, remove 'active' from all category chips
                        view.querySelectorAll('.category-filters .category-chip').forEach(btn => {
                            btn.classList.remove('active');
                        });

                        // Then, add 'active' to the specific button that was clicked
                        // This is a more robust way to find the exact button
                        const activeBtn = view.querySelector(`.category-filters .category-chip[onclick="App.events.changeFlashcardCategory('${category}')"]`);
                        if (activeBtn) {
                            activeBtn.classList.add('active');
                        }
                    }

                    // Re-render the flashcard grid as before
                    App.ui.filterAndRenderFlashcards();
                },


                changeFlashcardSort(e) { App.settings.set('flashcardSortBy', e.target.value); App.ui.filterAndRenderFlashcards(); },

                updateReadingProgress() {
                    requestAnimationFrame(() => {
                        const articleView = document.getElementById('article-view');
                        if (!articleView || !articleView.classList.contains('active')) return;

                        const mainEl = document.querySelector('main');
                        if (!mainEl) return;

                        const { scrollHeight, clientHeight, scrollTop } = mainEl;

                        if (scrollHeight <= clientHeight) {
                            App.ui.updateTheLine(1);
                            return;
                        }

                        let progress = scrollTop / (scrollHeight - clientHeight);

                        if (scrollTop + clientHeight >= scrollHeight - 2) {
                            progress = 1;
                        }

                        App.ui.updateTheLine(progress);
                    });
                },

                study: {
                    updateLimit(newLimit) {
                        const limit = parseInt(newLimit, 10);
                        if (limit > 0) {
                            App.settings.set('studySessionSize', limit);
                            App.ui.showToast(`Session size set to ${limit}`, { type: 'success' });
                        }
                    },

                    start(options = {}) {
                        const {
                            mode = 'limitedDue',
                            limit = App.settings.get('studySessionSize'),
                            quizCards = null,
                            quizType = 'none' // 'none', 'classic', or 'mcq'
                        } = options;

                        const isQuizMode = !!quizCards;
                        let cardsToStudy;
                        let toastMessage = "No new or due flashcards to study.";

                        if (isQuizMode) {
                            cardsToStudy = quizCards;
                            toastMessage = "You don’t have enough cards for a Quiz.";
                        } else {
                            cardsToStudy = App.util.getDueFlashcards();
                            if (mode === 'mcqOnly') {
                                cardsToStudy = cardsToStudy.filter(c => c.type === 'mcq');
                                toastMessage = "No due Multiple-Choice Questions in this deck.";
                            }
                            if (mode === 'limitedDue') {
                                cardsToStudy = cardsToStudy.slice(0, limit);
                            }
                        }

                        if (!cardsToStudy || cardsToStudy.length === 0) {
                            App.ui.showToast(toastMessage);
                            return;
                        }

                        App.state.studySession = { isActive: true, isQuizMode, quizType, cards: cardsToStudy, currentIndex: 0, isRating: false, activeTheme: 'default' };
                        document.body.classList.add('study-mode-active');
                        App.ui.renderStudyView(App.state.studySession);
                        App.ui.updateStudyProgressUI();
                    },

                    toggleFontSize(button) {
                        const fontSizes = ['0.85rem', '1rem', '1.2rem', '1.4rem', '1.6rem', '1.8rem', '2.0rem', '2.2rem', '2.4rem', '2.6rem', '2.8rem', '3rem'];
                        const currentSize = App.settings.get('studyCardFontSize') || '1.2rem';
                        const currentIndex = fontSizes.indexOf(currentSize);
                        const nextIndex = (currentIndex + 1) % fontSizes.length;
                        const newSize = fontSizes[nextIndex];

                        document.documentElement.style.setProperty('--study-card-font-size', newSize);
                        if (button) {
                            button.querySelector('span').textContent = newSize.replace('rem', '');
                        }
                        App.settings.set('studyCardFontSize', newSize);
                    },

                    rate(rating) {
                        const s = App.state.studySession;
                        if (!s.isActive || s.isRating) return;

                        App.util.hapticFeedback(); // <-- ADD THIS LINE

                        s.isRating = true;
                        const card = s.cards[s.currentIndex];
                        card.finalRating = rating;
                        if (!s.isQuizMode) {
                            const updatedCardData = App.util.sm2.rateCard(card, rating);
                            const originalArticle = App.storage.getArticle(card.articleId);
                            if (originalArticle?.flashcards?.[card.id]) {
                                const newFlashcards = { ...originalArticle.flashcards, [card.id]: { ...originalArticle.flashcards[card.id], ...updatedCardData } };
                                App.storage.updateArticle(originalArticle.id, { flashcards: newFlashcards });
                            }
                        }
                        const studyView = document.querySelector('.study-view');
                        if (studyView) {
                            const cardBox = studyView.querySelector('.study-card-content-box');
                            const ratingBtn = studyView.querySelector(`.btn-${rating.toLowerCase()}`);
                            cardBox.classList.add(`rated-${App.config.sm2.colors[rating]}`);
                            if (ratingBtn) ratingBtn.classList.add('btn-popped');
                        }
                        setTimeout(() => this.next(), 1500);
                    },

                    next() {
                        const s = App.state.studySession;
                        if (!s.isActive) return;

                        if (s.currentIndex >= s.cards.length - 1) {
                            this.exit(true);
                            return;
                        }
                        const currentCard = s.cards[s.currentIndex];
                        let nextIndex = s.currentIndex + 1;

                        if (s.cards[nextIndex].articleId === currentCard.articleId) {
                            // Find the first card further in the queue that is from a DIFFERENT article.
                            const alternateIndex = s.cards.findIndex((card, index) => index > nextIndex && card.articleId !== currentCard.articleId);

                            if (alternateIndex !== -1) {
                                // An alternate card was found. Swap it with the next card in line.
                                const relatedCard = s.cards[nextIndex];
                                s.cards[nextIndex] = s.cards[alternateIndex];
                                s.cards[alternateIndex] = relatedCard;
                            }
                        }

                        s.currentIndex++;
                        s.isRating = false;
                        App.ui.renderStudyView(s);
                        App.ui.updateStudyProgressUI();
                    },

                    prev() {
                        const s = App.state.studySession; if (!s.isActive || s.currentIndex === 0 || s.isRating) return;
                        s.currentIndex--; App.ui.renderStudyView(s); App.ui.updateStudyProgressUI();
                    },

                    exit(isCompleted = false) {
                        if (!App.state.studySession.isActive) return;
                        const session = { ...App.state.studySession };

                        // Reset state BEFORE showing results
                        App.state.studySession = { isActive: false, isQuizMode: false, quizType: 'none', cards: [], currentIndex: 0, isRating: false };
                        App.ui.renderStudyView(App.state.studySession); // This will remove the study view and body classes

                        if (session.isQuizMode && isCompleted) {
                            App.quiz.calculateAndShowResults(session.cards);
                        } else if (session.isQuizMode && !isCompleted) {
                            App.ui.showToast("Quiz abandoned!");
                            App.router.navigateTo('flashcard');
                        } else {
                            App.ui.showToast(isCompleted ? "Study session complete!" : "Study session exited.");
                            App.router.navigateTo('flashcard');
                        }
                    },

                    setupCardGestures(cardElement) {
                        let touchStartX = 0;
                        let touchStartY = 0;
                        let touchEndX = 0;
                        let touchEndY = 0;
                        const swipeThreshold = 50; // Minimum pixels to be considered a swipe

                        cardElement.addEventListener('touchstart', (e) => {
                            touchStartX = e.changedTouches[0].screenX;
                            touchStartY = e.changedTouches[0].screenY;
                        }, { passive: true });

                        cardElement.addEventListener('touchend', (e) => {
                            touchEndX = e.changedTouches[0].screenX;
                            touchEndY = e.changedTouches[0].screenY;
                            handleSwipeGesture();
                        }, { passive: true });

                        const handleSwipeGesture = () => {
                            const dx = touchEndX - touchStartX;
                            const dy = touchEndY - touchStartY;
                            const absDx = Math.abs(dx);
                            const absDy = Math.abs(dy);

                            if (App.state.studySession.isRating) return;

                            // Check if it's a horizontal swipe
                            if (absDx > swipeThreshold && absDx > absDy) {
                                if (dx > 0) {
                                    // Swiped Right -> Easy
                                    App.events.study.rate('Easy');
                                } else {
                                    // Swiped Left -> Again
                                    App.events.study.rate('Again');
                                }
                            }
                            // Check if it's a vertical swipe
                            else if (absDy > swipeThreshold && absDy > absDx) {
                                if (dy < 0) {
                                    // Swiped Up -> Good
                                    App.events.study.rate('Good');
                                }
                                // Optional: Swipe Down for "Hard"
                                // else {
                                //     App.events.study.rate('Hard');
                                // }
                            }
                        };
                    },

                    cycleStudyTheme(goBack = false) {
                        const themes = App.events.presentation.themes;
                        const session = App.state.studySession;
                        if (!session.isActive) return;

                        const currentIndex = themes.indexOf(session.activeTheme);
                        const nextIndex = goBack
                            ? (currentIndex - 1 + themes.length) % themes.length
                            : (currentIndex + 1) % themes.length;
                        session.activeTheme = themes[nextIndex];
                        App.ui.applyStudyTheme();

                        const themeName = session.activeTheme.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        App.ui.showToast(`${themeName} Theme`, { type: 'info', duration: 1500 });
                    },

                    resetStudyTheme() {
                        const session = App.state.studySession;
                        if (!session.isActive) return;
                        session.activeTheme = 'default';
                        App.ui.applyStudyTheme();
                        App.ui.showToast('Theme reset to default', { type: 'success', duration: 2000 });
                    },

                    handleKeyboard(e) {
                        if (App.state.studySession.isRating) return;

                        // New logic to handle scrolling with arrow keys
                        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                            e.preventDefault();
                            const studyCard = document.querySelector('.study-card');
                            if (!studyCard) return;

                            const isFlipped = studyCard.classList.contains('is-flipped');
                            const activeFaceSelector = isFlipped ? '.study-card-back' : '.study-card-front';
                            const contentBox = document.querySelector(`${activeFaceSelector} .study-card-content-box`);

                            if (contentBox) {
                                const scrollAmount = 75; // The number of pixels to scroll
                                contentBox.scrollTop += (e.key === 'ArrowDown' ? scrollAmount : -scrollAmount);
                            }
                            return; // Exit after handling scroll
                        }

                        switch (e.key) {
                            case ' ': e.preventDefault(); document.querySelector('.study-card')?.classList.toggle('is-flipped'); break;
                            case 'ArrowLeft': this.prev(); break;
                            case 'ArrowRight': this.next(); break;
                            case 'c':
                                App.events.study.cycleStudyTheme();
                                break;
                            case 'w':
                            case 'W':
                                App.whiteboard.open('scratchpad');
                                break;
                            case 'e':
                                document.querySelector('.study-controls .btn-icon-nav[onclick*="toggleFontSize"]')?.click();
                                break;
                            case 'Enter':
                                e.preventDefault();
                                document.querySelector('.study-card')?.classList.toggle('is-flipped');
                                break;
                            case 'a': e.preventDefault(); this.rate('Again'); break;
                            case '5': this.rate('Again'); break;
                            case '4': this.rate('Hard'); break;
                            case '3': this.rate('Hold'); break;
                            case '2': this.rate('Good'); break;
                            case '1': this.rate('Easy'); break;
                        }
                    }
                },

                async handleMcqAnswer(event, isStudyMode = false) {
                    const selectedOption = event.target.closest('.nk-mcq-option');
                    if (!selectedOption) return;

                    const mcqBlock = selectedOption.closest('.nk-mcq-block');
                    if (!mcqBlock) return;


                    event.preventDefault();
                    event.stopPropagation();

                    const isUserCorrect = selectedOption.dataset.isCorrect === 'true';
                    const quizType = mcqBlock.dataset.quizMode;

                    if (quizType === 'mcq') {

                        if (mcqBlock.dataset.answered === 'true') return;

                        mcqBlock.dataset.answered = 'true';
                        if (!isUserCorrect) {
                            mcqBlock.dataset.userIncorrect = 'true';
                        }
                        selectedOption.classList.add(isUserCorrect ? 'correct' : 'incorrect');
                        if (!isUserCorrect) {
                            mcqBlock.querySelector('.nk-mcq-option[data-is-correct="true"]')?.classList.add('correct');
                        }

                        const card = App.state.studySession.cards[App.state.studySession.currentIndex];
                        await App.quiz.handleMcqAnswer(isUserCorrect, card);

                        // DEFINITIVE FIX: Auto-advance to the next question after 3 seconds
                        setTimeout(() => {
                            App.events.study.next();
                        }, 3000);

                    } else { // Read Mode, Presentation Mode, Classic Study
                        const blocksToUpdate = isStudyMode ? document.querySelectorAll('.study-card-face .nk-mcq-block') : [mcqBlock];

                        blocksToUpdate.forEach(block => {
                            // RESET STATE for re-attempt
                            block.removeAttribute('data-user-incorrect');
                            block.querySelectorAll('.nk-mcq-option').forEach(opt => {
                                opt.classList.remove('correct', 'incorrect');
                            });

                            block.dataset.answered = 'true';
                            // Track incorrect answers for visual feedback
                            if (!isUserCorrect) {
                                block.dataset.userIncorrect = 'true';
                            }
                            const options = Array.from(block.querySelectorAll('.nk-mcq-option'));

                            // IMPROVED MATCHING LOGIC (Fixes Bug #2)
                            let selectedInBlock;
                            if (block === mcqBlock) {
                                // Direct match for Read Mode (Same Block)
                                selectedInBlock = selectedOption;
                            } else {
                                // Fallback for Study Mode (Cloned Block): Match by Index
                                const originalOptions = Array.from(mcqBlock.querySelectorAll('.nk-mcq-option'));
                                const originalIndex = originalOptions.indexOf(selectedOption);
                                if (originalIndex > -1 && options[originalIndex]) {
                                    selectedInBlock = options[originalIndex];
                                } else {
                                    // Last resort: Text match (risky but fallback)
                                    selectedInBlock = options.find(opt => opt.textContent === selectedOption.textContent);
                                }
                            }

                            const correctInBlock = options.find(opt => opt.dataset.isCorrect === 'true');

                            if (isUserCorrect) {
                                if (selectedInBlock) selectedInBlock.classList.add('correct');
                            } else {
                                if (selectedInBlock) selectedInBlock.classList.add('incorrect');
                                if (correctInBlock) correctInBlock.classList.add('correct');
                            }
                        });

                        if (isStudyMode) {
                            setTimeout(() => {
                                const studyCard = document.querySelector('.study-card');
                                if (studyCard && !studyCard.classList.contains('is-flipped')) {
                                    studyCard.classList.add('is-flipped');
                                }
                            }, 3000);
                        }
                    }
                },

                flashcardContextMenu(event, cardId) {
                    event.preventDefault();
                    const menuHtml = `<button onclick="App.events.resetFlashcard('${cardId}')">Reset Card Progress</button>`;
                    App.ui.showContextMenu(event.pageX, event.pageY, menuHtml);
                },
                async resetFlashcard(cardId) {
                    const card = App.util.getAllFlashcards().find(c => c.id === cardId); if (!card) return;
                    const article = App.storage.getArticle(card.articleId);
                    if (article && article.flashcards && article.flashcards[cardId]) {
                        const newFlashcards = { ...article.flashcards };

                        // ✨ FIX: Perform a complete factory reset on the card's learning data.
                        newFlashcards[cardId] = {
                            ...newFlashcards[cardId],
                            rating: null,
                            reviewCount: 0,
                            interval: 0,
                            lastReviewed: null,
                            nextReviewDue: null,
                            reviewHistory: [],
                            easeFactor: 2.5, // Reset Ease Factor to default
                            lapses: 0,       // Reset Leech counter
                        };

                        await App.storage.updateArticle(article.id, { flashcards: newFlashcards });
                        App.ui.filterAndRenderFlashcards();
                        App.ui.showToast("Card progress reset.");
                    }
                },
                resetFilteredFlashcardsConfirmation() {
                    const category = App.settings.get('flashcardCategory') || 'All';
                    App.ui.showConfirmationModal({
                        title: 'Reset Card Progress?',
                        message: `Are you sure you want to reset the progress for all flashcards in the current filter ("${category === 'All' ? 'All' : App.util.getCategoryDisplayName(category)}")? This action cannot be undone.`,
                        confirmText: 'Reset',
                        onConfirm: () => App.events.resetFilteredFlashcards()
                    });
                },
                async resetFilteredFlashcards() {
                    const cardsToReset = App.util.getSortedFlashcardsForDisplay();
                    if (cardsToReset.length === 0) { App.ui.showToast("No cards to reset in this view."); return; }
                    const articlesToUpdate = {};
                    for (const card of cardsToReset) {
                        if (!articlesToUpdate[card.articleId]) articlesToUpdate[card.articleId] = { ...App.storage.getArticle(card.articleId).flashcards };
                        articlesToUpdate[card.articleId][card.id] = { ...articlesToUpdate[card.articleId][card.id], rating: null, reviewCount: 0, interval: 0, lastReviewed: null, nextReviewDue: null, reviewHistory: [] };
                    }
                    App.ui.showToast("Resetting cards...", { type: 'info' });
                    for (const articleId in articlesToUpdate) await App.storage.updateArticle(articleId, { flashcards: articlesToUpdate[articleId] });
                    App.ui.filterAndRenderFlashcards();
                    App.ui.showToast(`${cardsToReset.length} cards have been reset.`, { type: 'success' });
                },
                async nudgeReviewDate(cardId, days) {
                    const card = App.util.getAllFlashcards().find(c => c.id === cardId);
                    if (!card || !card.nextReviewDue) { App.ui.showToast("Cannot nudge a new card."); return; }
                    const article = App.storage.getArticle(card.articleId);
                    if (article && article.flashcards && article.flashcards[cardId]) {
                        const newFlashcards = { ...article.flashcards };
                        const currentDueDate = new Date(card.nextReviewDue);
                        let newDueDate = new Date(currentDueDate.setDate(currentDueDate.getDate() + days));
                        if (newDueDate.getTime() < Date.now()) newDueDate = new Date();
                        newFlashcards[cardId].nextReviewDue = newDueDate.toISOString();
                        await App.storage.updateArticle(article.id, { flashcards: newFlashcards });
                        App.ui.filterAndRenderFlashcards();
                        App.ui.showToast(`Review date moved ${days > 0 ? 'forward' : 'back'} by ${Math.abs(days)} day(s).`);
                    }
                },

                deleteFlashcardConfirmation(cardId) {
                    const card = App.util.getAllFlashcards().find(c => c.id === cardId);
                    if (!card) return;

                    // Sanitize card text for display in the modal
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = card.type === 'collapsible' ? card.frontText : card.fullText;
                    const cardTextSample = (tempDiv.textContent || "").substring(0, 80);

                    App.ui.showConfirmationModal({
                        title: 'Delete Flashcard?',
                        message: `Are you sure you want to permanently delete this flashcard?<br><br><em>"${cardTextSample}..."</em>`,
                        confirmText: 'Delete',
                        onConfirm: () => App.events.deleteFlashcard(cardId)
                    });
                },

                async deleteFlashcard(cardId) {
                    const card = App.util.getAllFlashcards().find(c => c.id === cardId);
                    if (!card) return;

                    const article = App.storage.getArticle(card.articleId);
                    if (article && article.flashcards && article.flashcards[cardId]) {
                        const newFlashcards = { ...article.flashcards };
                        delete newFlashcards[cardId];
                        await App.storage.updateArticle(article.id, { flashcards: newFlashcards });

                        App.ui.filterAndRenderFlashcards();
                        App.ui.showToast("Flashcard deleted.");
                    } else {
                        App.ui.showToast("Could not find flashcard's source article.", { type: 'error' });
                    }
                },

                selectImage(container) {
                    this.deselectImage();
                    container.classList.add('selected');
                    App.state.selectedImageContainer = container;
                    App.ui.showImageToolbar(container);

                    const handle = container.querySelector('.resize-handle');
                    if (!handle) {
                        console.warn('No resize handle found for container:', container);
                        return; // Exit early if no handle exists
                    }

                    const isVisualFlashcard = container.classList.contains('nk-visual-flashcard');

                    // For visual flashcards, we need both images; for regular, just one
                    const images = isVisualFlashcard
                        ? container.querySelectorAll('.nk-vfc-front img, .nk-vfc-back img')
                        : [container.querySelector('img')];
                    const primaryImage = images[0];

                    const startResize = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        document.addEventListener('mousemove', onMove);
                        document.addEventListener('mouseup', onEnd);
                        document.addEventListener('touchmove', onMove, { passive: false });
                        document.addEventListener('touchend', onEnd);
                    };

                    const onMove = (e) => {
                        e.preventDefault();
                        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                        const rect = container.getBoundingClientRect();
                        let newWidth = clientX - rect.left;

                        if (isVisualFlashcard) {
                            // For visual flashcards, adjust the container's max-width and both images
                            container.style.maxWidth = `${newWidth}px`;
                            images.forEach(img => {
                                img.style.width = '100%';
                                img.style.height = 'auto';
                            });
                        } else {
                            // For regular images, maintain aspect ratio
                            const originalRatio = parseFloat(primaryImage.dataset.originalWidth) / parseFloat(primaryImage.dataset.originalHeight);
                            primaryImage.style.width = `${newWidth}px`;
                            primaryImage.style.height = `auto`; // Let browser calculate height based on new width
                        }
                    };

                    const onEnd = () => {
                        document.removeEventListener('mousemove', onMove);
                        document.removeEventListener('mouseup', onEnd);
                        document.removeEventListener('touchmove', onMove);
                        document.removeEventListener('touchend', onEnd);
                        App.state.isArticleDirty = true; // Mark for autosave after resizing
                    };

                    handle.addEventListener('mousedown', startResize);
                    handle.addEventListener('touchstart', startResize, { passive: false });
                },


                deselectImage() {
                    if (App.state.selectedImageContainer) {
                        App.state.selectedImageContainer.classList.remove('selected');
                        App.state.selectedImageContainer = null;
                        App.ui.hideImageToolbar();
                    }
                },

                handleImageAlignment(alignClass) {
                    const container = App.state.selectedImageContainer; if (!container) return;
                    if (alignClass === 'reset-size') {
                        const isVisualFlashcard = container.classList.contains('nk-visual-flashcard');
                        if (isVisualFlashcard) {
                            // Reset visual flashcard size
                            container.style.maxWidth = '';
                            const images = container.querySelectorAll('.nk-vfc-front img, .nk-vfc-back img');
                            images.forEach(img => {
                                img.style.width = '100%';
                                img.style.height = 'auto';
                            });
                        } else {
                            // Reset regular image size
                            const img = container.querySelector('img');
                            img.style.width = img.dataset.originalWidth + 'px';
                            img.style.height = 'auto';
                        }
                        return;
                    }
                    container.classList.remove('align-left', 'align-right', 'align-center');
                    if (alignClass) container.classList.add(alignClass);
                },
                async highlightImage() {
                    const container = App.state.selectedImageContainer;
                    if (!container) return;
                    const isHighlighted = container.classList.toggle('highlighted-image');
                    container.dataset.isHighlighted = isHighlighted;
                    await App.events.saveArticle({ isAutosave: true }); // CHANGED: Added silent save option
                    App.ui.showToast(isHighlighted ? 'Image highlighted!' : 'Image highlight removed.', { type: 'success' });
                    // Re-show toolbar to update button color
                    App.ui.showImageToolbar(container);
                },

                addImageCaption() {
                    const container = App.state.selectedImageContainer;
                    if (!container) return;

                    const theme = App.settings.get('captionTheme') || 'default';
                    const align = App.settings.get('captionAlign') || 'bottom';
                    container.setAttribute('data-caption-theme', theme);
                    container.setAttribute('data-caption-align', align);


                    let caption = container.querySelector('.image-caption');

                    if (caption) {
                        caption.setAttribute('contenteditable', 'true');
                        caption.style.pointerEvents = 'auto'; // Make interactive
                        caption.focus();
                    } else {
                        caption = document.createElement('div');
                        caption.className = 'image-caption';
                        caption.setAttribute('contenteditable', 'true');
                        caption.setAttribute('data-placeholder', 'Add a caption...');
                        container.appendChild(caption);
                        caption.focus();
                        App.state.isArticleDirty = true;
                    }
                    caption.onblur = async () => {
                        caption.removeAttribute('contenteditable');
                        caption.style.pointerEvents = 'none'; // Revert to non-interactive
                        if (caption.textContent.trim() === '' && caption.parentNode) {
                            caption.parentNode.removeChild(caption);
                        }
                        await App.events.saveArticle({ isAutosave: true }); // CHANGED: Added silent save option
                        App.ui.hideImageToolbar(); // Hide toolbar after editing
                    };

                    App.ui.showImageToolbar(container);
                },

                toggleShowTags() {
                    const current = App.settings.get('showTagsOnTiles');
                    App.settings.set('showTagsOnTiles', !current);
                    document.getElementById('show-tags-toggle').classList.toggle('active', !current);
                    App.ui.filterAndRenderArticles();
                },
                toggleMobileView() {
                    const current = App.settings.get('mobileViewEnabled');
                    App.settings.set('mobileViewEnabled', !current);
                    App.ui.applyMobileView();
                },

                toggleTextColorPopover(event) {
                    if (event) {
                        event.preventDefault();
                        event.stopPropagation();
                        const btn = event.currentTarget;
                        const group = btn.closest('.color-picker-group');
                        if (group) {
                            const popover = group.querySelector('.color-picker-popover');
                            if (popover) {
                                popover.classList.toggle('show');
                            }
                        }
                    }
                },

                selectTextColor(colorClass) {
                    const selection = window.getSelection();
                    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
                        App.ui.showToast("Please select some text first.", { type: 'warning' });
                        return;
                    }

                    // 1. Apply formatting
                    const success = this.applyFormatting('class', colorClass);

                    if (!success) {
                        App.ui.showToast("Could not apply color. Please try again.", { type: 'error' });
                        return;
                    }

                    // 2. Update storage/settings
                    const textColors = ['text-red', 'text-green', 'text-blue', 'text-magenta', 'text-orange', 'text-teal', 'text-slate'];
                    const newIndex = textColors.indexOf(colorClass);
                    if (newIndex >= 0) {
                        App.settings.set('textColorCycleIndex', newIndex);
                    }

                    // 3. Update UI (Direct DOM manipulation to preserve pinned state)
                    const pickerGroup = document.getElementById('text-color-picker-group');
                    if (pickerGroup) {
                        // Update Main Icon Color
                        const mainIconCircle = pickerGroup.querySelector('button svg circle');
                        if (mainIconCircle) {
                            mainIconCircle.setAttribute('fill', `var(--${colorClass})`);
                        }

                        // Update Active State in Popover
                        const popover = document.getElementById('text-color-popover');
                        if (popover) {
                            popover.querySelectorAll('.color-circle-btn').forEach(btn => btn.classList.remove('active'));
                            const newActiveBtn = popover.children[newIndex];
                            if (newActiveBtn) newActiveBtn.classList.add('active');
                        }
                    }
                },



                handleArticleControlsClick(e) {
                    const button = e.target.closest('button, .read-count-badge'); if (!button) return;
                    const { action, value } = button.dataset;

                    switch (action) {
                        case 'cycleReaderTheme': App.events.cycleReaderTheme(); break;
                        case 'goToCategory':
                            const article = App.storage.getArticle(App.state.activeArticleId);
                            if (article) App.router.navigateTo('category', { category: article.category, articleId: article.id });
                            break;
                        case 'switchToWrite': App.events.switchToMode('write'); break;
                        case 'finishArticle': App.events.finishArticle(); break;
                        case 'copyHighlights': App.services.export.copyCurrentArticleHighlights(); break;
                        case 'exportHtml': App.ui.showExportBrandModal((brandName, brandLink) => App.services.export.exportArticleAsHtml(brandName, brandLink), 'HTML'); break;
                        case 'shareArticle': App.services.share.article(); break;
                        case 'exportNoteKash': App.ui.showNoteKashExportModal(); break;
                        case 'exportPdf': App.ui.showExportBrandModal((brandName, brandLink) => App.services.export.exportArticleAsPdf(brandName, brandLink), 'PDF'); break;
                        case 'printArticle': App.events.printDocument(); break;
                        case 'resetReadCount': App.events.resetReadCount(); break;
                        case 'toggleFocusMode': App.events.toggleFocusMode(); break;
                        case 'saveAndRead': App.events.saveArticle({ switchToRead: true }); break;
                        case 'deleteArticle': App.events.deleteArticleWithConfirmation(); break;
                        case 'format': if (value === 'cloze') App.events.applyFormatting('cloze'); else App.events.applyFormatting('class', value); break;
                        case 'manageTable': App.events.showTableModal(); break;
                        case 'insertAccordion': App.events.insertAccordionCard(); break;
                        case 'insertCheckbox': {
                            const selection = window.getSelection();
                            let selectedText = '';
                            if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
                                selectedText = selection.toString().trim().replace(/\n/g, ' ');
                            }
                            const checkboxTextContent = selectedText ? selectedText : '<br>';
                            const insertPara = !selectedText;
                            const checkboxHTML = `<div class="nk-checkbox-wrapper" data-checked="false"><span class="nk-checkbox-box"></span><span class="nk-checkbox-text">${checkboxTextContent}</span></div>${insertPara ? '<p><br></p>' : ''}`;
                            document.execCommand('insertHTML', false, checkboxHTML);
                            setTimeout(() => {
                                if (!selectedText) {
                                    const sel = window.getSelection();
                                    if (sel && sel.focusNode) {
                                        const wrapper = sel.focusNode.nodeType === 1 ? sel.focusNode.previousElementSibling : sel.focusNode.parentElement.previousElementSibling;
                                        if (wrapper && wrapper.classList && wrapper.classList.contains('nk-checkbox-wrapper')) {
                                            App.util.placeCursor(wrapper.querySelector('.nk-checkbox-text'));
                                            return;
                                        }
                                    }
                                    const lastCheckbox = document.querySelector('.nk-checkbox-wrapper:last-of-type .nk-checkbox-text');
                                    if (lastCheckbox) App.util.placeCursor(lastCheckbox);
                                }
                            }, 10);
                            App.state.isArticleDirty = true;
                            break;
                        }
                        case 'applyListStyle':
                            const selection = window.getSelection(); if (!selection.focusNode) break;
                            const focusElement = selection.focusNode.nodeType === Node.TEXT_NODE ? selection.focusNode.parentElement : selection.focusNode;
                            let list = focusElement.closest('ul, ol');
                            if (value === 'ordered-alpha') {
                                if (list && list.tagName === 'UL') {
                                    document.execCommand('insertOrderedList', false);
                                    list = window.getSelection().focusNode.parentElement.closest('ol');
                                } else if (!list) {
                                    document.execCommand('insertOrderedList', false);
                                    list = window.getSelection().focusNode.parentElement.closest('ol');
                                }
                                if (list) list.setAttribute('type', 'a');
                            } else {
                                if (list) list.className = value;
                                else { document.execCommand('insertUnorderedList', false); setTimeout(() => { const newList = window.getSelection().focusNode.parentElement.closest('ul'); if (newList) newList.className = value; }, 0); }
                            }
                            break;
                        case 'execCommand': 
                            if (value === 'bold') {
                                App.events.toggleBold();
                            } else {
                                document.execCommand(value);
                            }
                            break;
                    }
                },

                categories: {
                    _refreshActiveView() {
                        const activeViewId = App.router.getActiveView();
                        if (activeViewId && ['library', 'flashcard', 'stats-dashboard', 'article'].includes(activeViewId)) {
                            App.router.navigateTo(activeViewId);
                        }
                    },

                    refreshManager() {
                        const container = document.getElementById('category-list-container');
                        if (!container) return;
                        const categories = App.settings.get('userCategories');

                        container.innerHTML = categories.map(cat => {
                            // UPDATED: Get the display name for rendering
                            const displayName = App.util.getCategoryDisplayName(cat.name);
                            return `
                        <div class="settings-item" data-category-name="${App.util.escapeHtml(cat.name)}">
                            <span class="category-name-display" style="display: inline-flex; align-items: center; gap: 8px;">
                                <span style="width: 16px; height: 16px; border-radius: 50%; background-color: ${App.util.getCategoryColor(cat.colorIndex)}; border: 1px solid var(--border-color); display: inline-block; flex-shrink: 0;"></span>
                                ${App.util.escapeHtml(displayName)}
                            </span>
                            <div class="category-item-controls">
                                <button class="btn-icon" onclick="App.events.categories.initiateRename(this)" title="Rename"><i class="fa-solid fa-pen"></i></button>
                                <button class="btn-icon" onclick="App.events.categories.cycleColor('${cat.name}')" title="Change Color"><i class="fa-solid fa-palette"></i></button>
                                <button class="btn-icon ${cat.isDefault ? 'is-disabled' : ''}" onclick="${cat.isDefault ? "App.ui.showToast('Don\\'t delete Source Category', 'warning')" : `App.events.categories.initiateDelete('${cat.name}')`}" title="${cat.isDefault ? 'This is the default source category and cannot be deleted.' : 'Delete'}"><i class="fa-solid fa-trash"></i></button>
                            </div>
                        </div>
                    `}).join('');

                        const style = document.createElement('style');
                        style.textContent = `
                        .category-name-display { flex-grow: 1; }
                        .category-item-controls { display: flex; gap: 0.5rem; }
                    `;
                        container.appendChild(style);
                    },
                    async executeOperationPlan(plan) {
                        App.ui.showToast('Resuming interrupted category operation...', { type: 'warning' });
                        switch (plan.operation) {
                            case 'migrate':
                                await this.migrateAndDelete(plan.source, plan.destination);
                                break;
                            case 'delete':
                                await this.deleteAll(plan.source);
                                break;
                            default:
                                console.error('Unknown operation in plan file:', plan);
                                await App.fs.write('_category_operation_plan.json', null);
                        }
                    },
                    async add(name) {
                        const trimmedName = name.trim();
                        if (!trimmedName) return;
                        let categories = App.settings.get('userCategories');
                        if (categories.some(c => c.name.toLowerCase() === trimmedName.toLowerCase())) {
                            App.ui.showToast(`Category "${trimmedName}" already exists.`, 'warning');
                            return;
                        }

                        const newCategory = {
                            name: trimmedName,
                            colorIndex: categories.length % App.util.getCategoryColorCount()
                        };
                        categories.push(newCategory);

                        await App.settings.set('userCategories', categories);
                        App.ui.showToast(`Category "${trimmedName}" added.`, 'success');
                        this.refreshManager();
                        this._refreshActiveView();
                    },

                    initiateRename(buttonEl) {
                        const item = buttonEl.closest('.settings-item');
                        const nameDisplay = item.querySelector('.category-name-display');
                        const oldName = item.dataset.categoryName; // This is the stable, internal name
                        const currentDisplayName = App.util.getCategoryDisplayName(oldName);

                        nameDisplay.innerHTML = `<input type="text" class="text-input" value="${App.util.escapeHtml(currentDisplayName)}" style="padding: 4px 8px; font-size: 0.9rem;">`;
                        const input = nameDisplay.querySelector('input');
                        input.focus();
                        input.select();

                        const save = () => App.events.categories.saveRename(input, oldName);
                        input.onblur = save;
                        input.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); input.blur(); } };
                    },

                    async saveRename(inputEl, oldName) {
                        const newDisplayName = inputEl.value.trim();
                        let categories = App.settings.get('userCategories');
                        const categoryToUpdate = categories.find(c => c.name === oldName);

                        // If the new name is empty, or the same as the internal name, we reset it.
                        if (!newDisplayName || newDisplayName === oldName) {
                            if (categoryToUpdate) {
                                delete categoryToUpdate.displayName; // Remove the displayName property
                            }
                        } else {
                            // Check for duplicate display names before saving.
                            if (categories.some(c => c.displayName === newDisplayName && c.name !== oldName)) {
                                App.ui.showToast(`Display name "${newDisplayName}" is already in use.`, 'warning');
                                this.refreshManager(); // Re-render to show the original name
                                return;
                            }
                            // Set the new display name.
                            if (categoryToUpdate) {
                                categoryToUpdate.displayName = newDisplayName;
                            }
                        }

                        // Save the updated categories array to settings.
                        await App.settings.set('userCategories', categories);
                        App.ui.showToast(`Category display name updated.`, 'success');

                        // Refresh the UI to reflect the change.
                        this.refreshManager();
                        this._refreshActiveView();
                    },

                    initiateDelete(catName) {
                        const articleCount = App.state.articles.filter(a => a.category === catName).length;
                        const otherCategories = App.settings.get('userCategories').filter(c => c.name !== catName);
                        const migrationOptions = otherCategories.map(c => `<option value="${c.name}">${App.util.getCategoryDisplayName(c.name)}</option>`).join('');

                        let migrateSection = '';
                        if (articleCount > 0) {
                            migrateSection = `
                            <h4>Option 1: Migrate (Safe)</h4>
                            <p>Move all ${articleCount} articles from "${catName}" to another category.</p>
                            <div style="display:flex; gap: 0.5rem; align-items: center;">
                                <select id="migrate-dest-category" class="text-input" style="flex-grow:1;">${migrationOptions}</select>
                                <button class="btn btn-primary" id="migrate-btn">Migrate</button>
                            </div>`;
                        }

                        App.ui.showCustomModal({
                            title: `⚠️ Delete '${catName}'?`,
                            message: `
                            <p>This category contains <strong>${articleCount} articles</strong>.</p>
                            ${migrateSection}
                            <h4 style="color: var(--danger-color); margin-top: 1.5rem;">Option 2: Delete All (Permanent)</h4>
                            <p>This will permanently delete the category AND all articles within it. This cannot be undone.</p>`,
                            buttons: [
                                { text: 'Cancel', className: 'btn-secondary', onClick: () => App.ui.closeModal() },
                                {
                                    text: `Delete All (${articleCount} Articles)`, className: 'btn-danger', onClick: () => {
                                        App.ui.showConfirmationModal({
                                            title: 'Are you absolutely sure?',
                                            message: `This will permanently delete the '${catName}' category and all ${articleCount} articles within it. This action cannot be undone.`,
                                            confirmText: 'Yes, Delete Everything',
                                            onConfirm: () => App.events.categories.deleteAll(catName)
                                        });
                                    }
                                }
                            ]
                        });

                        const migrateBtn = document.getElementById('migrate-btn');
                        if (migrateBtn) {
                            migrateBtn.onclick = () => {
                                const dest = document.getElementById('migrate-dest-category').value;
                                App.events.categories.migrateAndDelete(catName, dest);
                            };
                        }
                    },

                    async cycleColor(categoryName) {
                        let categories = App.settings.get('userCategories');
                        const categoryToUpdate = categories.find(c => c.name === categoryName);

                        if (categoryToUpdate) {
                            categoryToUpdate.colorIndex = (categoryToUpdate.colorIndex + 1) % App.util.getCategoryColorCount();
                            await App.settings.set('userCategories', categories);
                            this.refreshManager(); // Refresh the modal UI
                            this._refreshActiveView(); // Refresh the main app UI
                        }
                    },

                    async migrateAndDelete(sourceCat, destCat) {

                        if (!document.getElementById('migration-overlay')) {
                            App.ui.closeModal();
                            App.ui.migrationScreen.show(`Migrating from '${sourceCat}'`);
                        }

                        // STEP 1: Create the plan file before starting.
                        const plan = { operation: 'migrate', source: sourceCat, destination: destCat, status: 'pending' };
                        await App.fs.write('_category_operation_plan.json', plan);

                        try {
                            const articlesToMove = App.state.articles.filter(a => a.category === sourceCat);

                            for (let i = 0; i < articlesToMove.length; i++) {
                                if (App.ui.migrationScreen.state.isCancelled) {
                                    await App.fs.write('_category_operation_plan.json', null); // Cleanup if cancelled
                                    return;
                                }
                                const article = articlesToMove[i];
                                await App.storage.updateArticle(article.id, { category: destCat });
                                const progress = Math.round(((i + 1) / articlesToMove.length) * 80);
                                App.ui.migrationScreen.update(progress, `Moving article ${i + 1} of ${articlesToMove.length}...`);
                            }

                            if (App.ui.migrationScreen.state.isCancelled) {
                                await App.fs.write('_category_operation_plan.json', null);
                                return;
                            }



                            App.ui.migrationScreen.update(95, "Finalizing category settings...");
                            let categories = App.settings.get('userCategories');
                            categories = categories.filter(c => c.name !== sourceCat);
                            await App.settings.set('userCategories', categories);

                            if (App.state.storageMode === 'browser') {
                                App.state.articles = await App.browserStore.getAllArticles();
                            }

                            App.ui.migrationScreen.update(100, "Migration Complete!");
                            App.ui.showToast(`Moved ${articlesToMove.length} articles and deleted '${sourceCat}'.`, 'success');

                            // STEP 2: Delete the plan file ONLY after all steps are successful.
                            await App.fs.write('_category_operation_plan.json', null);

                            this.refreshManager();
                            this._refreshActiveView();

                        } catch (error) {
                            console.error("Migration failed:", error);
                            App.ui.showToast("An error occurred during migration. The operation will resume on next launch.", "error");
                        } finally {
                            setTimeout(() => App.ui.migrationScreen.hide(), 1500);
                        }
                    },

                    async deleteAll(catName) {
                        if (!document.getElementById('migration-overlay')) {
                            App.ui.closeModal();
                            App.ui.migrationScreen.show(`Deleting '${catName}'`);
                        }

                        // STEP 1: Create the plan file.
                        const plan = { operation: 'delete', source: catName, status: 'pending' };
                        await App.fs.write('_category_operation_plan.json', plan);

                        try {
                            const articlesToDelete = App.state.articles.filter(a => a.category === catName);

                            for (let i = 0; i < articlesToDelete.length; i++) {
                                if (App.ui.migrationScreen.state.isCancelled) {
                                    await App.fs.write('_category_operation_plan.json', null); // Cleanup if cancelled
                                    return;
                                }
                                const article = articlesToDelete[i];
                                await App.storage.deleteArticle(article.id);
                                const progress = Math.round(((i + 1) / articlesToDelete.length) * 80);
                                App.ui.migrationScreen.update(progress, `Deleting article ${i + 1} of ${articlesToDelete.length}...`);
                            }

                            if (App.ui.migrationScreen.state.isCancelled) {
                                await App.fs.write('_category_operation_plan.json', null);
                                return;
                            }



                            App.ui.migrationScreen.update(95, "Finalizing category settings...");
                            let categories = App.settings.get('userCategories');
                            categories = categories.filter(c => c.name !== catName);
                            await App.settings.set('userCategories', categories);

                            if (App.state.storageMode === 'browser') {
                                App.state.articles = await App.browserStore.getAllArticles();
                            }

                            App.ui.migrationScreen.update(100, "Deletion Complete!");
                            App.ui.showToast(`Deleted '${catName}' and ${articlesToDelete.length} articles.`, 'success');

                            // STEP 2: Delete the plan file on success.
                            await App.fs.write('_category_operation_plan.json', null);

                            this.refreshManager();
                            this._refreshActiveView();

                        } catch (error) {
                            console.error("Deletion failed:", error);
                            App.ui.showToast("An error occurred during deletion. The operation will resume on next launch.", "error");
                        } finally {
                            setTimeout(() => App.ui.migrationScreen.hide(), 1500);
                        }
                    },
                },


                saveDropboxClientId() {
                    const id = document.getElementById('dropbox-client-id-input').value.trim();
                    App.settings.set('dropboxClientId', id);
                    App.ui.showToast('Dropbox Client ID saved!', { type: 'success' });
                    App.ui.showStorageModal();
                },

                removeDropboxClientId() {
                    App.settings.set('dropboxClientId', null);
                    App.ui.showToast('Dropbox Client ID removed.');
                    App.ui.showStorageModal();
                },

                toggleCategoryHighlights() {
                    const container = document.querySelector('.category-view-container');
                    const toggle = document.getElementById('highlight-toggle');
                    if (!container || !toggle) return;

                    const isHiding = container.classList.toggle('hide-snippet-colors');
                    toggle.classList.toggle('active', !isHiding);
                    App.settings.set('categoryHighlightsVisible', !isHiding);
                },

                setCategoryLayout(mode) {
                    App.settings.set('categoryLayout', mode);
                    const container = document.querySelector('.category-view-container');
                    if (container) {
                        const category = App.util.getOriginalCategoryName(container.querySelector('h2').textContent.split(': ')[1] || 'All');
                        App.ui.renderCategoryView(document.getElementById('category-view'), category);
                    }
                },

                // Optimized: Lazy Load Focus Mode
                enterFocusMode(articleId) {
                    const container = document.querySelector('.category-view-container');
                    let sortedArticles = [];
                    let initialIndex = 0;

                    if (container) {
                        // Context: Category View (Snippets Only)
                        const category = container.dataset.category || 'All';
                        sortedArticles = App.services.export.getSortedArticlesForCategory(category);

                        // Filter to match the view (only articles with snippets)
                        sortedArticles = sortedArticles.filter(a => {
                            const c = a.content || '';
                            return c.includes('highlight-') || c.includes('==') || c.includes('nk-mcq') || c.includes('nk-timeline');
                        });
                    } else {
                        const targetArticle = App.storage.getArticle(articleId);
                        if (!targetArticle) return; // Error

                        const category = targetArticle.category || 'All';
                        sortedArticles = App.services.export.getSortedArticlesForCategory(category);
                    }

                    if (sortedArticles.length === 0) {
                        App.ui.showToast("No articles found to focus on.", 'info');
                        return;
                    }

                    // Find safe index
                    initialIndex = sortedArticles.findIndex(a => a.id === articleId);

                    if (initialIndex === -1) {
                        sortedArticles = [App.storage.getArticle(articleId)].filter(Boolean);
                        initialIndex = 0;
                    }

                    App.state.focusSession = {
                        isActive: true,
                        articles: sortedArticles,
                        currentIndex: initialIndex,
                        isStageMode: false,
                        currentSlideIndex: 0,
                        scrollStops: [],
                        activeTheme: 'default',
                        isCinematicActive: false,
                        teleprompterActive: false,
                        annotations: {},
                    };

                    // PREPARE CURRENT ARTICLE IMMEDIATELY
                    this.prepareFocusArticle(initialIndex);

                    App.ui.renderFocusMode();
                    document.addEventListener('keydown', this.handleFocusModeKeyDown);
                    document.body.style.overflow = 'hidden';
                },

                enterFocusModeForCategory(categoryName) {
                    const articlesForCategory = App.services.export.getSortedArticlesForCategory(categoryName);

                    // Fast filter
                    const candidateArticles = articlesForCategory.filter(a => {
                        const c = a.content || '';
                        return c.includes('highlight-') || c.includes('==') || c.includes('nk-mcq') || c.includes('nk-timeline');
                    });

                    if (candidateArticles.length === 0) {
                        App.ui.showToast(`No snippets found in category "${categoryName}" to focus on.`, 'info');
                        return;
                    }

                    App.state.focusSession = {
                        isActive: true,
                        articles: candidateArticles,
                        currentIndex: 0,
                        isStageMode: false,
                        currentSlideIndex: 0,
                        scrollStops: [],
                        activeTheme: 'default',
                        isCinematicActive: false,
                        teleprompterActive: false,
                        annotations: {},
                    };

                    this.prepareFocusArticle(0);

                    App.ui.renderFocusMode();
                    document.addEventListener('keydown', this.handleFocusModeKeyDown);
                    document.body.style.overflow = 'hidden';
                },

                // NEW HELPER: JIT Snippet Parser
                prepareFocusArticle(index) {
                    const session = App.state.focusSession;
                    if (!session || !session.articles[index]) return null;

                    let article = session.articles[index];

                    // 1. CLONE FOR SESSION: Ensure we work with a session-specific copy
                    if (!article._isFocusClone) {
                        article = { ...article, _isFocusClone: true };
                        delete article.snippets;
                        session.articles[index] = article;
                    }

                    if (article.snippets) return article; // Already processed

                    // 2. EXTRACT SNIPPETS
                    article.snippets = App.util.extractSnippets(article, ['highlight', 'mcq', 'blocks', 'cloze'], true);

                    // 3. SORT SNIPPETS (if needed)
                    if (article.snippets.length > 0) {
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = article.content;
                        const allElements = Array.from(tempDiv.querySelectorAll(
                            '.snippet, .nk-mcq-block, .nk-timeline-block, .chart-container, .nk-video-embed, ' +
                            '.highlight-1, .highlight-2, .highlight-3, .highlight-4, .highlight-5, .highlight-6, .image-container.highlighted-image'
                        ));
                        article.snippets.sort((a, b) => {
                            const elA = tempDiv.querySelector(`[id="${a.id}"]`);
                            const elB = tempDiv.querySelector(`[id="${b.id}"]`);
                            if (!elA || !elB) return 0;
                            return allElements.indexOf(elA) - allElements.indexOf(elB);
                        });
                    }

                    // 4. CLEANUP: RESET MCQS FOR PRESENTATION
                    if (article.snippets.length > 0) {
                        const cleaner = document.createElement('div');
                        article.snippets.forEach(snippet => {
                            if (snippet.type === 'mcq') {
                                cleaner.innerHTML = snippet.html;
                                const block = cleaner.querySelector('.nk-mcq-block');
                                if (block) {
                                    block.removeAttribute('data-answered');
                                    block.removeAttribute('data-user-incorrect');
                                    block.removeAttribute('data-is-correct');

                                    block.querySelectorAll('.nk-mcq-option').forEach(opt => {
                                        opt.classList.remove('selected', 'correct', 'incorrect');
                                        opt.removeAttribute('data-selected');
                                        const radio = opt.querySelector('.nk-mcq-option-radio');
                                        if (radio) radio.classList.remove('checked');
                                    });
                                    snippet.html = cleaner.innerHTML;
                                }
                            }
                        });
                    }

                    // Restore annotations if any
                    if (!session.annotations[article.id] && article.stageAnnotations) {
                        session.annotations[article.id] = JSON.parse(JSON.stringify(article.stageAnnotations));
                    }

                    return article;
                },

                exitFocusMode() {
                    if (!App.state.focusSession.isActive) return;

                    // Ensure Pro Presenter is deactivated when exiting focus mode
                    if (App.state.focusSession.isProPresenterActive) {
                        App.events.presentation.toggleProPresenter();
                    }

                    const aiMagicToggle = document.getElementById('ai-magic-toggle');
                    if (aiMagicToggle) aiMagicToggle.style.display = 'none';
                    // NEW: Save annotations before closing
                    const session = App.state.focusSession;
                    const article = session.articles[session.currentIndex];
                    if (article) {
                        const currentAnnotations = JSON.stringify(article.stageAnnotations || {});
                        const newAnnotations = JSON.stringify(session.annotations);

                        if (currentAnnotations !== newAnnotations) {
                            // Find the original article in the main state to update it
                            const mainArticle = App.storage.getArticle(article.id);
                            if (mainArticle) {
                                mainArticle.stageAnnotations = JSON.parse(newAnnotations);
                                App.events.saveArticle({ isAutosave: true });
                            }
                        }
                    }

                    if (App.annotationEngine.state.isActive) {
                        App.annotationEngine.toggle(App.annotationEngine.state.context);
                    }

                    App.state.focusSession.isActive = false;
                    const overlay = document.getElementById('focus-mode-overlay');
                    if (overlay) {
                        overlay.removeEventListener('click', App.events.handleContentClick);
                        const bodyEl = overlay.querySelector('.focus-mode-body');
                        if (bodyEl) {
                            bodyEl.removeEventListener('mouseover', App.events.handleSpotlight);
                            bodyEl.removeEventListener('mouseout', App.events.handleSpotlight);
                        }
                        overlay.remove();
                    }
                    document.removeEventListener('keydown', this.handleFocusModeKeyDown);

                    // MEMORY OP: Aggressively clear session data
                    App.state.focusSession.articles = [];
                    App.util.freeMemory();

                    document.body.style.overflow = '';
                },


                navigateFocusMode(direction) {
                    const { articles, currentIndex } = App.state.focusSession;
                    if (!articles) return;
                    const newIndex = currentIndex + direction;

                    if (newIndex >= 0 && newIndex < articles.length) {
                        App.state.focusSession.currentIndex = newIndex;
                        App.ui.renderFocusMode();
                    }
                },

                toggleStageMode() {
                    const session = App.state.focusSession;

                    // Clean up innovations when exiting Stage Mode
                    if (session.isStageMode) {
                        const bodyEl = document.querySelector('.focus-mode-body');
                        if (bodyEl) {
                            // Innovation 1: Cleanup Bento layouts
                            App.ui._cleanupStageModeBentoLayouts(bodyEl);

                            // Innovation 3: Cleanup 2D camera viewport
                            App.ui._cleanup2DCameraViewport(bodyEl);
                        }
                    }

                    session.isStageMode = !session.isStageMode;
                    session.currentSlideIndex = 0;
                    session.scrollStops = [];
                    App.ui.renderFocusMode();
                },

                navigateStageSlide(direction) {
                    const session = App.state.focusSession;
                    if (!session.isActive || !session.isStageMode) return;

                    // --- NEW: SIGMA ARTICLE NAVIGATION ---
                    if (session.sigmaMode === 'article') {
                        const body = document.querySelector('.focus-mode-overlay .focus-mode-content') ||
                            document.querySelector('.focus-mode-body');
                        const overlay = document.querySelector('.focus-mode-overlay');
                        if (body && overlay) {
                            const scrollAmount = window.innerHeight * 0.8; // Scroll 80% of screen height

                            // Add transition class for presentation-like fade effect
                            overlay.classList.add('article-nav-transitioning');

                            // Slight delay before scroll to let fade-out start
                            setTimeout(() => {
                                body.scrollBy({
                                    top: scrollAmount * direction,
                                    behavior: 'smooth'
                                });

                                // Remove transition class after scroll animation completes
                                setTimeout(() => {
                                    overlay.classList.remove('article-nav-transitioning');
                                }, 350);
                            }, 80);
                        }
                        return; // Stop here, do not do slide navigation
                    }

                    const newIndex = session.currentSlideIndex + direction;

                    // INNOVATION 2: List Build Animation
                    // When moving forward, check if there are hidden list items to reveal first
                    if (direction > 0) {
                        const body = document.querySelector('.focus-mode-body');
                        if (body && App.ui._hasHiddenListItems(body)) {
                            // Reveal the next list item instead of advancing slide
                            if (App.ui._revealNextListItem(body)) {
                                return; // Don't advance slide, we revealed a list item
                            }
                        }
                    }

                    if (newIndex >= 0 && newIndex < session.scrollStops.length) {
                        session.currentSlideIndex = newIndex;

                        const body = document.querySelector('.focus-mode-body');
                        if (body) {
                            // INNOVATION 3: 2D Camera navigation
                            if (session.cameraMap && session.cameraMap.positions[newIndex]) {
                                const pos = session.cameraMap.positions[newIndex];
                                App.ui._navigate2DCamera(body, pos.x, pos.y);

                                // Add transitioning class for visual feedback
                                const overlay = document.querySelector('.focus-mode-overlay');
                                if (overlay) {
                                    overlay.classList.add('is-transitioning');
                                    setTimeout(() => overlay.classList.remove('is-transitioning'), 700);
                                }
                            } else {
                                // Fallback to scroll-based navigation
                                body.scrollTo({
                                    top: session.scrollStops[newIndex],
                                    behavior: 'smooth'
                                });
                            }
                        }
                        App.ui.renderFocusModeControls();
                        setTimeout(() => {
                            const container = document.querySelector('.focus-mode-body');
                            if (!container) return;
                            container.querySelectorAll('.spotlight-key-focus').forEach(el => el.classList.remove('spotlight-key-focus'));
                            const newFirstItem = container.querySelector('.is-visible');
                            if (newFirstItem) {
                                // Apply the spotlight to it, ready for the next ArrowDown press.
                                newFirstItem.classList.add('spotlight-key-focus');
                                newFirstItem.focus({ preventScroll: true });
                            }

                            // After navigating to a new slide, reset list build state
                            // so the first item is visible and others are hidden
                            if (session.sigmaMode !== 'article') {
                                const visibleSnippet = container.querySelector('.snippet.is-visible, .stage-bento-split.is-visible, .stage-hero-image.is-visible');
                                if (visibleSnippet) {
                                    const lists = visibleSnippet.querySelectorAll('ul, ol');
                                    lists.forEach(list => {
                                        const items = list.querySelectorAll('li');
                                        items.forEach((item, index) => {
                                            if (index === 0) {
                                                item.classList.add('stage-build-visible');
                                                item.classList.remove('stage-build-hidden');
                                            } else {
                                                item.classList.add('stage-build-hidden');
                                                item.classList.remove('stage-build-visible');
                                            }
                                        });
                                    });
                                }
                            }
                        }, 400);
                    }
                },


                // UNIFIED LASER POINTER (Read & Stage Mode)
                toggleSharedLaser(context = 'stage') {
                    // Context: 'stage' (Focus/Stage Mode) or 'read' (Read/Global Mode)
                    let overlay, canvasId, pointerId;

                    if (context === 'stage') {
                        overlay = document.querySelector('.focus-mode-overlay');
                        canvasId = 'laser-trail-canvas';
                        pointerId = 'laser-pointer';
                    } else {
                        overlay = document.body;
                        canvasId = 'read-mode-laser-canvas';
                        pointerId = 'read-mode-laser-pointer';
                    }

                    if (!overlay) return;

                    let laserCanvas = document.getElementById(canvasId);
                    let pointer = document.getElementById(pointerId);
                    const activeClass = context === 'stage' ? 'laser-active' : 'read-mode-laser-active';

                    // INITIALIZATION
                    if (!pointer) {
                        pointer = document.createElement('div');
                        pointer.id = pointerId;
                        Object.assign(pointer.style, {
                            position: 'fixed',
                            width: '11px',
                            height: '11px',
                            background: '#ff0055',
                            borderRadius: '50%',
                            boxShadow: '0 0 8px #ff0055, 0 0 16px #ff0055',
                            pointerEvents: 'none',
                            zIndex: '2147483647',
                            display: 'none',
                            transform: 'translate(-50%, -50%)',
                            transition: 'transform 0.035s linear, box-shadow 0.2s ease, background 0.2s ease'
                        });
                        overlay.appendChild(pointer);
                    }

                    if (!laserCanvas) {
                        laserCanvas = document.createElement('canvas');
                        laserCanvas.id = canvasId;
                        Object.assign(laserCanvas.style, {
                            position: 'fixed', // Use fixed for both
                            top: '0',
                            left: '0',
                            width: '100%',
                            height: '100%',
                            pointerEvents: 'none',
                            zIndex: '2147483646'
                        });
                        overlay.appendChild(laserCanvas);

                        const resizeCanvas = () => {
                            laserCanvas.width = context === 'stage' ? overlay.clientWidth : window.innerWidth;
                            laserCanvas.height = context === 'stage' ? overlay.clientHeight : window.innerHeight;
                        };
                        window.addEventListener('resize', resizeCanvas);
                        resizeCanvas();
                    }

                    const isActive = !overlay.classList.contains(activeClass);

                    if (isActive) {
                        // Surgical: Theme Awareness & Aesthetic Upgrade
                        const themeSource = context === 'stage' ? overlay : (document.querySelector('.article-view-wrapper') || document.body);
                        const style = getComputedStyle(themeSource);
                        const rawText = style.getPropertyValue('--text-primary').trim();
                        const rawPrimary = style.getPropertyValue('--primary-color').trim();

                        const laserColor = rawText || '#ff0055';
                        const glowColor = rawPrimary || laserColor;

                        overlay.classList.add(activeClass);
                        // Hide pointer until first movement to avoid a "stuck center dot"
                        // caused by showing a fixed element before coordinates are set.
                        pointer.style.display = 'none';
                        pointer.style.left = '-9999px';
                        pointer.style.top = '-9999px';

                        // Apply Aesthetic Update to Pointer
                        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
                        const isDarkTheme = currentTheme === 'dark'; // 'sepia' counts as light-ish for laser physics

                        if (isDarkTheme) {
                            pointer.style.background = `radial-gradient(circle at 32% 30%, #ffffff 0%, ${laserColor} 45%, ${glowColor} 100%)`;
                            pointer.style.boxShadow = `0 0 10px ${glowColor}, 0 0 20px ${laserColor}, 0 0 30px ${glowColor}`;
                            pointer.style.border = `1px solid color-mix(in srgb, #ffffff 35%, transparent)`;
                        } else {
                            pointer.style.background = `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.98) 0%, ${laserColor} 58%, color-mix(in srgb, ${glowColor} 70%, #000 30%) 100%)`;
                            pointer.style.boxShadow = `0 1px 6px rgba(0,0,0,0.22), 0 0 14px color-mix(in srgb, ${glowColor} 35%, transparent)`;
                            pointer.style.border = `1px solid color-mix(in srgb, ${laserColor} 25%, #ffffff 75%)`;
                        }

                        laserCanvas.style.display = 'block';

                        // Do not block native Stage scrolling; capture on scroll container instead.
                        laserCanvas.style.pointerEvents = context === 'stage' ? 'none' : 'auto';
                        laserCanvas.style.cursor = 'none';
                        const eventTarget = context === 'stage'
                            ? (overlay.querySelector('.focus-mode-content') || overlay)
                            : laserCanvas;

                        if (context === 'stage') document.getElementById('laser-pointer-toggle')?.classList.add('active');

                        const ctx = laserCanvas.getContext('2d', { willReadFrequently: true });
                        let paths = [];
                        let currentPath = null;
                        let animationFrameId;

                        const draw = () => {
                            if (!overlay.classList.contains(activeClass)) return;

                            ctx.clearRect(0, 0, laserCanvas.width, laserCanvas.height);
                            ctx.lineCap = 'round';
                            ctx.lineJoin = 'round';

                            const activePaths = [...paths, currentPath];
                            const drawPaths = () => {
                                activePaths.forEach(path => {
                                    if (!path || path.length < 2) return;
                                    ctx.beginPath();
                                    ctx.moveTo(path[0].x, path[0].y);
                                    for (let i = 1; i < path.length; i++) {
                                        const p = path[i];
                                        const prev = path[i - 1];
                                        const cx = (prev.x + p.x) / 2;
                                        const cy = (prev.y + p.y) / 2;
                                        ctx.quadraticCurveTo(prev.x, prev.y, cx, cy);
                                    }
                                    ctx.stroke();
                                });
                            };

                            // RENDER LASER TRAIL
                            if (isDarkTheme) {
                                // DARK MODE: NEON / LIGHTSABER PHYSICS
                                // Pass 1: The Glow (Atmosphere) - Additive blending for light physics
                                ctx.globalCompositeOperation = 'lighter';
                                ctx.lineWidth = 6;
                                ctx.shadowBlur = 10;
                                ctx.shadowColor = glowColor;
                                ctx.strokeStyle = glowColor;
                                drawPaths();

                                // Pass 2: The Core (Hot Plasma)
                                ctx.globalCompositeOperation = 'source-over';
                                ctx.lineWidth = 2;
                                ctx.shadowBlur = 1;
                                ctx.shadowColor = '#fff';
                                ctx.strokeStyle = '#fff'; // Always white hot core
                                drawPaths();
                            } else {
                                // LIGHT/SEPIA MODE: FOUNTAIN PEN / MARKER PHYSICS
                                // Pass 1: The Stain/Bleed (Softer, wider, low opacity)
                                ctx.globalCompositeOperation = 'source-over'; // Normal blending (ink on paper)
                                ctx.lineWidth = 7;
                                ctx.lineCap = 'round';
                                ctx.shadowBlur = 6;
                                ctx.shadowColor = glowColor; // Use primary/glow color as the "wash"
                                ctx.strokeStyle = glowColor;
                                ctx.globalAlpha = 0.3; // Transparent bleed
                                drawPaths();

                                // Pass 2: The Ink Flow (Solid, sharper)
                                ctx.globalAlpha = 1.0;
                                ctx.lineWidth = 2.5;
                                ctx.shadowBlur = 1;
                                ctx.shadowColor = 'rgba(0,0,0,0.1)';
                                ctx.strokeStyle = laserColor; // Use the text color (dark) as ink
                                drawPaths();
                            }

                            animationFrameId = requestAnimationFrame(draw);
                        };
                        draw();



                        // Event Handlers
                        const moveHandler = (e) => {
                            if (pointer.style.display !== 'block') pointer.style.display = 'block';
                            pointer.style.left = `${e.clientX}px`;
                            pointer.style.top = `${e.clientY}px`;
                            if (currentPath) currentPath.push({ x: e.clientX, y: e.clientY });
                        };
                        const downHandler = (e) => {
                            if (e.button !== 0) return;
                            if (context !== 'stage') e.preventDefault();
                            currentPath = [{ x: e.clientX, y: e.clientY }];
                        };
                        const upHandler = () => {
                            if (currentPath && currentPath.length > 0) paths.push(currentPath);
                            currentPath = null;
                        };
                        const tripleClickHandler = (e) => {
                            if (e.detail === 3) {
                                paths = [];
                                currentPath = null;
                            }
                        };

                        const wheelHandler = (e) => {
                            // Manual scroll relay to fix locked scrolling in laser mode
                            const scrollTarget = context === 'stage' ? eventTarget : (document.querySelector('main') || document.scrollingElement || document.documentElement || document.body);
                            if (!scrollTarget) return;

                            // Prevent native to avoid conflict, manually move the scroll position
                            e.preventDefault();
                            scrollTarget.scrollTop += e.deltaY;
                            scrollTarget.scrollLeft += e.deltaX;
                        };

                        // Unified Key Handler
                        const keyHandler = (e) => {
                            if (e.key === 'Escape' || (e.key.toLowerCase() === 'l' && !e.repeat)) {
                                e.preventDefault();
                                e.stopPropagation();
                                App.events.toggleSharedLaser(context);
                            }
                        };

                        eventTarget.addEventListener('mousemove', moveHandler);
                        eventTarget.addEventListener('mousedown', downHandler);
                        eventTarget.addEventListener('wheel', wheelHandler, { passive: false });
                        window.addEventListener('mouseup', upHandler);
                        eventTarget.addEventListener('click', tripleClickHandler);
                        document.addEventListener('keydown', keyHandler, true); // Capture phase importance

                        laserCanvas._cleanup = () => {
                            eventTarget.removeEventListener('mousemove', moveHandler);
                            eventTarget.removeEventListener('mousedown', downHandler);
                            eventTarget.removeEventListener('wheel', wheelHandler);
                            window.removeEventListener('mouseup', upHandler);
                            eventTarget.removeEventListener('click', tripleClickHandler);
                            document.removeEventListener('keydown', keyHandler, true);
                            cancelAnimationFrame(animationFrameId);
                        };

                    } else {
                        // Deactivate
                        overlay.classList.remove(activeClass);
                        pointer.style.display = 'none';
                        laserCanvas.style.display = 'none';
                        laserCanvas.style.pointerEvents = 'none';
                        if (context === 'stage') document.getElementById('laser-pointer-toggle')?.classList.remove('active');

                        const ctx = laserCanvas.getContext('2d', { willReadFrequently: true });
                        ctx.clearRect(0, 0, laserCanvas.width, laserCanvas.height);
                        if (laserCanvas._cleanup) laserCanvas._cleanup();

                    }
                },

                // SCREENSHOT CAPTURE - Uses native Screen Capture API for perfect rendering

                async captureVisibleStage() {
                    const overlay = document.getElementById('focus-mode-overlay');
                    if (!overlay) {
                        console.warn('captureVisibleStage: Stage overlay not found');
                        return null;
                    }

                    // Hide UI controls before capture
                    const controlsToHide = overlay.querySelectorAll(
                        '.focus-mode-controls, .stage-mode-controls, #annotation-toolbar, ' +
                        '#laser-pointer, #laser-trail-canvas, #teleprompter-controls'
                    );
                    controlsToHide.forEach(el => el.style.visibility = 'hidden');

                    // Wait for UI to update
                    await new Promise(r => setTimeout(r, 80));

                    let dataUrl = null;

                    try {
                        // Use Screen Capture API - the only method that works with modern CSS
                        if (!navigator.mediaDevices?.getDisplayMedia) {
                            throw new Error('Screen Capture API not supported');
                        }

                        const stream = await navigator.mediaDevices.getDisplayMedia({
                            video: { displaySurface: 'browser', preferCurrentTab: true },
                            preferCurrentTab: true,
                            selfBrowserSurface: 'include'
                        });

                        const track = stream.getVideoTracks()[0];
                        const imageCapture = new ImageCapture(track);
                        const bitmap = await imageCapture.grabFrame();
                        stream.getTracks().forEach(t => t.stop());

                        // Draw to canvas and convert to data URL
                        const canvas = document.createElement('canvas');
                        canvas.width = bitmap.width;
                        canvas.height = bitmap.height;
                        canvas.getContext('2d').drawImage(bitmap, 0, 0);
                        dataUrl = canvas.toDataURL('image/png');

                    } catch (error) {
                        if (error.name === 'NotAllowedError' || error.name === 'AbortError') {
                        } else {
                            console.error('Screenshot error:', error);
                        }
                    }

                    // Restore UI controls
                    controlsToHide.forEach(el => el.style.visibility = '');

                    return dataUrl;
                },


                async exportCurrentSlide() {
                    App.ui.showToast('📸 Click "Allow" to capture screenshot', { type: 'info', duration: 3000 });

                    const dataUrl = await this.captureVisibleStage();

                    if (!dataUrl) {
                        App.ui.showToast('Screenshot cancelled', { type: 'info', duration: 1500 });
                        return;
                    }

                    try {
                        const blob = await (await fetch(dataUrl)).blob();
                        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                        App.ui.showToast('✅ Screenshot copied to clipboard!', { type: 'success', duration: 2000 });
                    } catch (err) {
                        console.error('Clipboard write failed:', err);
                        App.ui.showToast('⚠️ Could not copy to clipboard', { type: 'error', duration: 2500 });
                    }
                },


                handleFocusModeKeyDown(e) {
                    // Skip if user is typing in whiteboard textbox or any input
                    if (App.whiteboard?.state?.isOpen) {
                        const isTyping = e.target.tagName === 'INPUT' ||
                            e.target.tagName === 'TEXTAREA' ||
                            e.target.isContentEditable ||
                            e.target.closest('.wb-text-box');
                        if (isTyping) return; // Let textbox handle the input
                    }

                    if (e.target.closest('.ai-magic-viewer-panel')) {
                        return;
                    }
                    const session = App.state.focusSession;
                    if (!session.isActive) return;

                    const bodyEl = document.querySelector('.focus-mode-body');
                    if (bodyEl) {
                        bodyEl.classList.toggle('spotlight-active', e.altKey);
                        if (!e.altKey) { bodyEl.querySelector('.spotlight')?.classList.remove('spotlight'); }
                    }

                    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                        if (session.isStageMode && session.sigmaMode === 'article') {
                            e.preventDefault();
                            e.stopPropagation();
                            const bodyEl = document.querySelector('.focus-mode-body');
                            if (bodyEl) {
                                const direction = e.key === 'ArrowDown' ? 1 : -1;
                                bodyEl.scrollBy({ top: direction * 50, behavior: 'auto' });
                            }
                            return;
                        }
                        e.preventDefault();
                        e.stopPropagation();

                        const direction = e.key === 'ArrowDown' ? 1 : -1;

                        if (session.isCinematicActive && session.isStageMode) {
                            // In Cinematic mode, up/down navigates through snippets on the current slide
                            const overlay = document.getElementById('focus-mode-overlay');
                            const allItems = Array.from(overlay.querySelectorAll('.snippet, .nk-mcq-block, .nk-timeline-block, .chart-container, .nk-accordion'));
                            if (allItems.length === 0) return;

                            const currentIndex = allItems.findIndex(el => el.classList.contains('is-revealing'));
                            let nextIndex = currentIndex + direction;
                            nextIndex = Math.max(0, Math.min(allItems.length - 1, nextIndex));

                            if (currentIndex !== nextIndex || currentIndex === -1) {
                                allItems.forEach(item => item.classList.remove('is-revealing', 'spotlight-key-focus'));
                                const targetItem = allItems[nextIndex];
                                targetItem.classList.add('is-revealing', 'spotlight-key-focus');
                                targetItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                App.events.typewriter.start(targetItem);
                            }
                        } else {
                            // In all other modes, up/down navigates the spotlight
                            App.events.spotlight.navigate(direction);
                        }
                        return; // Arrow key action is handled.
                    }

                    // --- Handle all other keys ---
                    if (session.isStageMode) {
                        const stageKeys = [' ', 'arrowright', 'pagedown', 'arrowleft', 'pageup', 'enter', 'a', 'b', 'd', 'c', 'l', 'w', 'p', 'escape', 'g', 'h', 'f'];
                        if (stageKeys.includes(e.key.toLowerCase())) {
                            e.preventDefault();
                            e.stopPropagation();
                        }

                        switch (e.key.toLowerCase()) {
                            case ' ': case 'arrowright': case 'pagedown': App.events.navigateStageSlide(1); break;
                            case 'arrowleft': case 'pageup': App.events.navigateStageSlide(-1); break;
                            case 'enter':
                                const focusedEl = document.querySelector('.spotlight-key-focus');
                                if (focusedEl) {
                                    const accordionTrigger = focusedEl.querySelector('.nk-accordion-trigger');
                                    if (accordionTrigger) {
                                        accordionTrigger.click();
                                    }
                                    else if (focusedEl.classList.contains('nk-mcq-block')) {
                                        App.events.handleMcqAnswer({ target: focusedEl }, false);
                                    }
                                    else if (focusedEl.classList.contains('snippet')) {
                                        focusedEl.click();
                                    }
                                }
                                break;
                            case 's': App.events.toggleStageMode(); break;
                            case 'b': document.querySelector('.focus-mode-overlay')?.classList.toggle('blackout-active'); break;
                            // LOCKED FEATURES
                            case 'd': // Annotation
                                if (!App.license.isPremium()) App.ui.showAscensionModal();
                                else App.annotationEngine.toggle('focus');
                                break;
                            case 'p': // Screenshot
                                if (!App.license.isPremium()) App.ui.showAscensionModal();
                                else App.events.exportCurrentSlide();
                                break;
                            case 'f': App.events.toggleFocusModeControls(); break;
                            case 'g': // Cinematic Reveal
                                if (!App.license.isPremium()) App.ui.showAscensionModal();
                                else App.events.presentation.toggleCinematicMotion(document.querySelector('.stage-mode-controls .btn-icon[onclick*="toggleCinematicMotion"]'));
                                break;
                            case 'r': if (isAnnotationActive) App.annotationEngine.setTool('rect'); break;
                            case 'e': if (isAnnotationActive) App.annotationEngine.setTool('eraser'); break;
                            case 'x': App.events.annotation.clear(); break;
                            case 'c':
                                if (isAnnotationActive) App.annotationEngine.cycleColor();
                                else App.events.presentation.cycleAmbiance();
                                break;
                            case 't': // NEW SHORTCUT
                                if (isAnnotationActive) App.annotationEngine.cycleThickness();
                                break;
                            case 'l': App.events.toggleSharedLaser('stage'); break;
                            case 'w': App.events.annotation.toggleWhiteboard(document.querySelector('#annotation-toolbar .btn-icon[onclick*="toggleWhiteboard"]')); break;

                            case 'h': document.querySelector('.stage-mode-controls .btn-icon[onclick*="toggleStageModeHighlights"]')?.click(); break;
                            case 'a': App.ui.aiMagicModal.open(); break;
                            case 'i': App.events.presentation.toggleTeleprompter(); break;
                            case '+':
                            case '=':
                                App.events.presentation.adjustTeleprompterFont(0.1);
                                break;
                            case '-':
                                App.events.presentation.adjustTeleprompterFont(-0.1);
                                break;

                            case 'escape':
                                const overlay = document.querySelector('.focus-mode-overlay');
                                if (overlay?.classList.contains('annotation-active')) App.events.annotation.toggle();
                                else if (overlay?.classList.contains('laser-active')) App.events.toggleSharedLaser('stage');
                                else if (overlay?.classList.contains('blackout-active')) overlay.classList.remove('blackout-active');
                                else App.events.toggleStageMode();
                                break;
                        }
                    } else { // Standard Focus Mode
                        const standardKeys = ['enter', 'escape', 'pagedown', 'pageup', 'arrowright', 'arrowleft', 'h', 's'];
                        if (standardKeys.includes(e.key.toLowerCase())) {
                            e.preventDefault();
                            e.stopPropagation();
                        }
                        switch (e.key.toLowerCase()) {
                            case 'c': App.events.presentation.cycleAmbiance(); break; // Cycle Color
                            case 'e': // Font Size
                                const fontBtn = document.getElementById('focus-font-size-btn');
                                if (fontBtn) App.events.toggleFocusModeFontSize(fontBtn);
                                break;
                            case 'f': App.events.toggleFocusModeControls(); break;
                            case 'enter':
                                const focusedEl = document.querySelector('.spotlight-key-focus');
                                if (focusedEl) {
                                    const accordionTrigger = focusedEl.querySelector('.nk-accordion-trigger');
                                    if (accordionTrigger) {
                                        accordionTrigger.click();
                                    }
                                    else if (focusedEl.classList.contains('nk-mcq-block')) {
                                        App.events.handleMcqAnswer({ target: focusedEl }, false);
                                    }
                                    else if (focusedEl.classList.contains('snippet')) {
                                        focusedEl.click();
                                    }
                                }
                                break;
                            case 'escape': App.events.exitFocusMode(); break;
                            case 'pagedown': case 'arrowright': App.events.navigateFocusMode(1); break;
                            case 'pageup': case 'arrowleft': App.events.navigateFocusMode(-1); break;
                            case 'h': document.querySelector('.focus-mode-controls .btn-icon[onclick*="toggleFocusModeHighlights"]')?.click(); break;
                            case 's': App.events.toggleStageMode(); break;
                            case 'a': App.ui.aiMagicModal.open(); break;
                        }
                    }
                },



                toggleSnippetVisibility(event) {
                    const snippet = event.currentTarget;
                    snippet.classList.toggle('is-hidden');
                },
                toggleFocusModeFontSize(button) {
                    const fontSizes = ['0.85rem', '1rem', '1.2rem', '1.4rem', '1.6rem', '1.8rem', '2.0rem', '2.2rem', '2.4rem', '2.6rem', '2.8rem', '3rem'];
                    const body = document.querySelector('.focus-mode-body');
                    if (!body || !button) return;

                    // RATIONALE: Reading the current size from settings is more reliable than calculating from the DOM.
                    const currentSize = App.settings.get('focusModeFontSize') || '1.1rem';
                    const currentIndex = fontSizes.indexOf(currentSize);

                    const nextIndex = (currentIndex + 1) % fontSizes.length;
                    const newSize = fontSizes[nextIndex];

                    // RATIONALE: We now update the CSS variable instead of the style directly. This is the correct pattern.
                    body.style.setProperty('--focus-mode-font-size', newSize);
                    button.querySelector('span').textContent = newSize.replace('rem', '');
                    App.settings.set('focusModeFontSize', newSize);
                },
                toggleFocusModeControls() {
                    const overlay = document.querySelector('.focus-mode-overlay');
                    if (!overlay) return;

                    const isHidden = overlay.classList.toggle('controls-hidden');
                    const toggleBtn = document.getElementById('focus-mode-immersive-toggle');



                    if (toggleBtn) {
                        toggleBtn.title = isHidden ? 'Show Controls' : 'Hide Controls';
                        // Update icon if it is the standard focus mode button (which has svg content)
                        if (toggleBtn.querySelector('svg')) {
                            toggleBtn.innerHTML = isHidden ? App.util.icons.compress : App.util.icons.expand;
                        }
                    }

                    // Minified toast
                    if (isHidden) App.ui.showToast('Immersive(f)', 'info');
                },

                toggleFocusModeHighlights(button) {
                    const body = document.querySelector('.focus-mode-body');
                    if (!body || !button) return;
                    const isHiding = body.classList.toggle('hide-snippet-colors');
                    button.classList.toggle('active', !isHiding);
                    App.settings.set('categoryHighlightsVisible', !isHiding);
                },

                toggleStageModeHighlights(button) {
                    const body = document.querySelector('.focus-mode-body');
                    if (!body || !button) return;

                    const isHiding = body.classList.toggle('hide-snippet-colors');
                    button.classList.toggle('active', !isHiding);
                    App.settings.set('categoryHighlightsVisible', !isHiding);
                },

                toggleSigmaMode(button) {
                    const session = App.state.focusSession;

                    // CYCLE STATES: presentation -> article -> presentation
                    const modes = ['presentation', 'article'];
                    const currentMode = session.sigmaMode || 'presentation';
                    const nextIndex = (modes.indexOf(currentMode) + 1) % modes.length;
                    session.sigmaMode = modes[nextIndex];

                    App.ui.renderFocusMode();

                    const titles = {
                        'presentation': "Sigma Mode: Presentation",
                        'article': "Sigma Mode: Full Article"
                    };
                    // NEW: Initialize temporary annotations for Sigma Article Mode if not present
                    if (session.sigmaMode === 'article' && !session.sigmaAnnotations) {
                        session.sigmaAnnotations = {};
                    }
                    if (App.annotationEngine.state.isActive) {
                        setTimeout(() => App.annotationEngine.redrawPageAnnotations(), 50);
                    }

                    const msg = titles[session.sigmaMode] || "Sigma Mode";
                    App.ui.showToast(msg, 'info', 1500);
                },

                triggerZipImport() {
                    App.ui.showConfirmationModal({
                        title: 'Confirm Import',
                        message: 'Select a <b>.zip</b> backup, <b>PDF</b>, or one or more <b>.notekash</b> / <b>.json</b> note files to import. Existing notes will be intelligently merged.',
                        confirmText: 'Proceed',
                        onConfirm: () => {
                            const input = document.getElementById('import-files-input'); // <-- Use new ID
                            input.onchange = (e) => { App.services.backup.handleFileImport(e.target.files); }; // <-- Call new handler
                            input.click();
                        }
                    });
                },

                handleMapAction(event, action) {
                    event.preventDefault();
                    event.stopPropagation();
                    const btn = event.currentTarget.closest('.nk-map-btn'); // Robust selector
                    const container = btn.closest('.nk-map-embed');
                    const iframe = container.querySelector('iframe');

                    if (action === 'delete') {
                        // Custom Confirm Modal
                        const modalId = `confirm-modal-${Date.now()}`;
                        const modalHTML = `
                        <div id="${modalId}" class="modal-backdrop" style="animation: fadeIn 0.2s ease-out; z-index: 20000; background-color: rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; position:fixed; top:0; left:0; width:100%; height:100%;">
                            <div class="modal-content ui-card" style="max-width: 400px; width:90%; transform-origin: center center; animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); background: var(--bg-secondary); padding: 20px; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                                <h3 style="margin-top:0; margin-bottom: 10px;">Remove Map?</h3>
                                <p style="margin-bottom: 20px; opacity: 0.8;">Are you sure you want to remove this map from your note?</p>
                                <div class="modal-buttons" style="margin-top: 0; display:flex; justify-content: flex-end; gap: 10px;">
                                    <button class="btn btn-secondary" id="${modalId}-cancel">Cancel</button>
                                    <button class="btn btn-primary" id="${modalId}-confirm" style="background: var(--danger-color); border-color: var(--danger-color);">Remove</button>
                                </div>
                            </div>
                        </div>`;

                        document.body.insertAdjacentHTML('beforeend', modalHTML);
                        const modalEl = document.getElementById(modalId);
                        const cancelBtn = document.getElementById(`${modalId}-cancel`);
                        const confirmBtn = document.getElementById(`${modalId}-confirm`);

                        const cleanup = () => modalEl.remove();

                        confirmBtn.onclick = () => {
                            // Check if we are in fullscreen (reparented) mode
                            const placeholderId = container.dataset.placeholderId;
                            if (placeholderId) {
                                const placeholder = document.getElementById(placeholderId);
                                if (placeholder) {
                                    // Remove the placeholder from the flow
                                    if (placeholder.nextElementSibling && placeholder.nextElementSibling.tagName === 'P' && placeholder.nextElementSibling.textContent.trim() === '') {
                                        placeholder.nextElementSibling.remove();
                                    }
                                    placeholder.remove();
                                }
                            } else {
                                // Standard removal
                                if (container.nextElementSibling && container.nextElementSibling.tagName === 'P' && container.nextElementSibling.textContent.trim() === '') {
                                    container.nextElementSibling.remove();
                                }
                            }

                            container.remove();
                            App.state.isArticleDirty = true;
                            App.ui.showToast('Map removed.', { type: 'success' });
                            cleanup();
                        };

                        cancelBtn.onclick = cleanup;
                        modalEl.onclick = (e) => { if (e.target === modalEl) cleanup(); };

                    } else if (action === 'fullscreen') {
                        // Theater Mode (In-Window Fullscreen via Reparenting)
                        const isFullscreen = container.classList.contains('is-viewport-fullscreen');
                        const icon = btn.querySelector('i');

                        if (isFullscreen) {
                            const placeholderId = container.dataset.placeholderId;
                            const placeholder = document.getElementById(placeholderId);

                            if (placeholder) {
                                placeholder.replaceWith(container);
                            } else {
                                console.warn("Map placeholder missing, leaving map at body root.");
                            }

                            container.classList.remove('is-viewport-fullscreen');
                            delete container.dataset.placeholderId;

                            // Update Icon
                            icon.classList.replace('fa-compress', 'fa-expand');
                            btn.title = "Toggle Fullscreen";
                            container.style.zIndex = '';

                        } else {
                            // ENTER Fullscreen
                            // 1. Create placeholder
                            const placeholder = document.createElement('div');
                            placeholder.id = `map-placeholder-${Date.now()}`;
                            placeholder.className = 'nk-map-placeholder';
                            const rect = container.getBoundingClientRect();
                            placeholder.style.width = container.style.width || '100%';
                            placeholder.style.height = container.style.height || rect.height + 'px';
                            placeholder.style.margin = container.style.margin;

                            // 2. Mark container
                            container.dataset.placeholderId = placeholder.id;

                            // 3. Swap
                            container.replaceWith(placeholder);
                            document.body.appendChild(container);

                            // 4. Apply Fixed Styles
                            container.classList.add('is-viewport-fullscreen');

                            icon.classList.replace('fa-expand', 'fa-compress');
                            btn.title = "Exit Fullscreen";
                            container.style.zIndex = '1000000';
                        }

                    } else if (action === 'edit') {
                        const currentSrc = iframe.src;
                        const urlMatch = currentSrc.match(/q=([^&]+)/);
                        const currentQuery = urlMatch ? decodeURIComponent(urlMatch[1]) : '';

                        App.ui.showInputModal(
                            "Update Map Location",
                            "Enter city, country, or landmark...",
                            currentQuery,
                            (newLocation) => {
                                if (newLocation && newLocation !== currentQuery) {
                                    const newSrc = currentSrc.replace(/q=([^&]+)/, `q=${encodeURIComponent(newLocation)}`);
                                    iframe.src = newSrc;
                                    App.ui.showToast(`Map updated to: ${newLocation}`, { type: 'success' });
                                }
                            }
                        );
                    }
                },
};
