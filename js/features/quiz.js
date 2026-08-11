export const quiz = {
                stats: {},
                session: {}, // To hold the state of the active quiz
                defaults: { lastScore: 0, bestScore: 0, totalScore: 0, totalQuizzes: 0, avgScore: 0 },
                async loadStats() { this.stats = await App.fs.read('quiz_stats.json') || { ...this.defaults }; },
                async saveStats() { await App.fs.write('quiz_stats.json', this.stats); },
                getStats() { return this.stats; },

                start(options = {}) {
                    const { mode = 'classic' } = options; // 'classic' for Recall, 'mcq' for Recognition
                    const quizSize = 10;
                    let availableCards = App.util.getSortedFlashcardsForDisplay();
                    let toastMessage = `You need at least ${quizSize} cards in this deck for a Recall Quiz.`;

                    // 1. Filter cards based on the selected quiz mode
                    if (mode === 'mcq') {
                        availableCards = availableCards.filter(c => c.type === 'mcq');
                        toastMessage = `You need at least ${quizSize} MCQs in this deck to start a Recognition Quiz.`;
                    } else { // 'classic' mode for Recall Quiz
                        availableCards = availableCards.filter(c => c.type === 'collapsible' || c.type === 'cloze');
                    }

                    if (availableCards.length < quizSize) {
                        App.ui.showToast(toastMessage, { type: 'warning' });
                        return;
                    }

                    // 2. The Smart Algorithm: 6 (SRS) + 2 (New) + 2 (Random)
                    let quizCards = [];
                    const now = new Date();

                    // Separate cards into buckets
                    const newCards = availableCards.filter(c => c.rating === null);
                    const dueCards = availableCards.filter(c => c.rating !== null && new Date(c.nextReviewDue) <= now);
                    const otherRatedCards = availableCards.filter(c => c.rating !== null && new Date(c.nextReviewDue) > now);

                    // Sort due cards by SRS priority (Again > Hard > ... > Easy)
                    const ratingOrder = { 'Again': 1, 'Hard': 2, 'Hold': 3, 'Good': 4, 'Easy': 5 };
                    dueCards.sort((a, b) => (ratingOrder[a.rating] || 6) - (ratingOrder[b.rating] || 6));

                    // Shuffle new and other cards for random selection
                    newCards.sort(() => 0.5 - Math.random());
                    otherRatedCards.sort(() => 0.5 - Math.random());

                    // 3. Assemble the quiz deck, handling edge cases
                    const takeFrom = (source, count) => {
                        const taken = source.splice(0, count);
                        quizCards.push(...taken);
                        return taken.length;
                    };

                    let needed = 6;
                    let taken = takeFrom(dueCards, needed);
                    needed -= taken;

                    // If not enough due cards, try to fill with new cards first
                    if (needed > 0) {
                        taken = takeFrom(newCards, needed);
                        needed -= taken;
                    }
                    // If still not enough, fill with other rated cards
                    if (needed > 0) {
                        takeFrom(otherRatedCards, needed);
                    }

                    // Now take the dedicated new and random cards
                    needed = 2;
                    taken = takeFrom(newCards, needed);
                    needed -= taken;
                    if (needed > 0) { // Fill from other sources if not enough new cards
                        taken = takeFrom(dueCards, needed);
                        if (taken < needed) takeFrom(otherRatedCards, needed - taken);
                    }

                    needed = 2;
                    taken = takeFrom(otherRatedCards, needed);
                    needed -= taken;
                    if (needed > 0) { // Fill from other sources if not enough random cards
                        taken = takeFrom(dueCards, needed);
                        if (taken < needed) takeFrom(newCards, needed - taken);
                    }

                    // Final shuffle to mix the card types
                    quizCards.sort(() => 0.5 - Math.random());

                    // 4. Start the quiz session
                    this.session = {
                        isActive: true,
                        mode: mode,
                        questions: quizCards,
                        score: 0,
                        answeredCardIds: new Set(),
                    };

                    App.events.study.start({ quizCards: quizCards, quizType: mode });
                },

                async handleMcqAnswer(isCorrect, card) {
                    if (!this.session.isActive || this.session.answeredCardIds.has(card.id)) return;

                    // FIX: No negative marking. 0 for incorrect.
                    this.session.score += isCorrect ? 1 : 0;
                    this.session.answeredCardIds.add(card.id);

                    const rating = isCorrect ? 'Hold' : 'Again';
                    const updatedCardData = App.util.sm2.rateCard(card, rating);
                    const article = App.storage.getArticle(card.articleId);
                    if (article?.flashcards?.[card.id]) {
                        const newFlashcards = { ...article.flashcards, [card.id]: { ...article.flashcards[card.id], ...updatedCardData } };
                        await App.storage.updateArticle(article.id, { flashcards: newFlashcards });
                    }
                },

                async handleMcqSkip(card) {
                    if (!this.session.isActive || this.session.answeredCardIds.has(card.id)) return;
                    this.session.answeredCardIds.add(card.id); // Mark as processed, score remains 0

                    const updatedCardData = App.util.sm2.rateCard(card, 'Again'); // Skipped counts as 'Again' for SRS
                    const article = App.storage.getArticle(card.articleId);
                    if (article?.flashcards?.[card.id]) {
                        const newFlashcards = { ...article.flashcards, [card.id]: { ...article.flashcards[card.id], ...updatedCardData } };
                        await App.storage.updateArticle(article.id, { flashcards: newFlashcards });
                    }
                },

                async calculateAndShowResults(completedCards) {
                    let score = 0;
                    if (this.session.mode === 'mcq') {
                        // FIX: Score is already non-negative
                        score = this.session.score;
                    } else { // Classic Quiz
                        completedCards.forEach(card => {
                            score += App.config.quiz.scores[card.finalRating] || 0;
                        });
                    }
                    if (!this.stats.quizHistory) {
                        this.stats.quizHistory = [];
                    }
                    this.stats.quizHistory.push(new Date().toISOString());
                    this.stats.lastScore = score;
                    this.stats.bestScore = Math.max(this.stats.bestScore, score);
                    this.stats.totalScore += score;
                    this.stats.totalQuizzes += 1;
                    this.stats.avgScore = this.stats.totalScore / this.stats.totalQuizzes;
                    await this.saveStats();
                    App.ui.showQuizResultModal(score, this.session.questions.length);

                    // Clean up the temporary rating property to prevent score leakage
                    completedCards.forEach(card => {
                        delete card.finalRating;
                    });

                    this.session = {}; // Reset session
                },
};
