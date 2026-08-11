export const license = {
    state: {
        tier: 'Spark', // Default free tier
        userName: '',
        isPremium: false,
        expiry: null,
        token: null
    },

    _lastFailedAt: 0,

    isPremium() {
        if (!this.state.isPremium || !this.state.expiry) return false;
        // Check if the expiry date is in the future
        return new Date(this.state.expiry) > new Date();
    },

    async activate() {
        // Client-side rate limiting: 30-second cooldown after each failed attempt
        const COOLDOWN_MS = 30 * 1000;
        const elapsed = Date.now() - this._lastFailedAt;
        if (this._lastFailedAt > 0 && elapsed < COOLDOWN_MS) {
            const remaining = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
            App.ui.showToast(`Please wait ${remaining}s before trying again.`, 'warning');
            return;
        }

        const nameInput = document.getElementById('license-name-input');
        const statusInput = document.getElementById('license-status-input');
        const keyInput = document.getElementById('license-key-input');
        const name = nameInput.value.trim();
        const status = statusInput.value.trim();
        const key = keyInput.value.trim();

        if (!name || !key) {
            App.ui.showToast('Please enter both your name and license key.', 'warning');
            return;
        }

        // Save status/bio locally regardless of activation success
        await App.settings.set('userBio', status);

        const validationUrl = '/validate';

        try {
            const response = await fetch(validationUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, key })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Activation failed.');

            const token = data.token;
            const payload = JSON.parse(atob(token.split('.')[1]));

            this.state.token = token;
            this.state.isPremium = payload.isPremium;
            this.state.tier = payload.tier;
            this.state.userName = payload.userName;
            this.state.expiry = payload.expiry;

            await App.settings.set('licenseToken', token);
            App.ui.showToast(`Welcome, ${payload.tier} ${payload.userName}! Premium activated.`, 'success');
            this.updateUIAfterStateChange();
            App.ui.closeModal();

        } catch (error) {
            this._lastFailedAt = Date.now();
            App.ui.showToast(`Activation Error: ${error.message}`, 'error');
            console.error('Activation Error:', error);
        }
    },

    revalidate() {
        if (this.isPremium()) {
            const expiryDate = new Date(this.state.expiry).toLocaleDateString();
            App.ui.showToast(`License for ${this.state.userName} is valid until ${expiryDate}.`, 'success');
        } else {
            App.ui.showToast('No active license found to re-validate.', 'warning');
        }
    },

    delete() {
        App.ui.showConfirmationModal({
            title: 'Delete License?',
            message: 'Are you sure you want to delete your license and revert to the Spark (free) tier? All premium features will be locked.',
            confirmText: 'Delete',
            onConfirm: async () => {
                await App.settings.set('licenseToken', null);
                // Do NOT delete userBio, they might want to keep it.
                this.state = { tier: 'Spark', userName: '', isPremium: false, expiry: null, token: null };
                this.updateUIAfterStateChange();
                App.ui.closeModal();
                App.ui.showToast('License removed. You are now on the Spark tier.', 'info');
            }
        });
    },

    async checkPendingTransactions() {
        try {
            const raw = localStorage.getItem('notekash_pending_transactions');
            if (!raw) return;
            const transactions = JSON.parse(raw);
            if (!Array.isArray(transactions) || transactions.length === 0) return;

            const { data: { session } } = await App.supabase.auth.getSession();
            if (!session) return;

            const remaining = [];
            const supabaseUrl = 'https://axzwfwjgndqjajabvscd.supabase.co';
            const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4endmd2pnbmRxamFqYWJ2c2NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyOTAzNDksImV4cCI6MjA5OTg2NjM0OX0.6N2mFFDcQW9rwrbNHZyXpoldbZNX-0RripH5Web3y-U';

            for (const tx of transactions) {
                try {
                    const res = await fetch(`${supabaseUrl}/functions/v1/verify-payment`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session.access_token}`,
                            'apikey': supabaseAnonKey
                        },
                        body: JSON.stringify({
                            payment_id: tx.payment_id,
                            tier: tx.tier
                        })
                    });
                    const data = await res.json();
                    if (res.ok && data.success) {
                        App.ui.showToast(`🎉 Recovered & activated your ${tx.tier} membership!`, "success");
                    } else if (Date.now() - (tx.timestamp || 0) < 7 * 24 * 60 * 60 * 1000) {
                        // Keep for retry if less than 7 days old
                        remaining.push(tx);
                    }
                } catch (err) {
                    remaining.push(tx);
                }
            }

            if (remaining.length > 0) {
                localStorage.setItem('notekash_pending_transactions', JSON.stringify(remaining));
            } else {
                localStorage.removeItem('notekash_pending_transactions');
            }
        } catch (e) {
            console.warn("Failed to process pending transactions:", e);
        }
    },

    async loadState() {
        // Automatically check and resolve any unverified pending transactions first
        await this.checkPendingTransactions();

        // Try loading from Supabase first if online and session exists
        try {
            const { data: { session } } = await App.supabase.auth.getSession();
            if (session) {
                const { data: profile, error } = await App.supabase
                    .from('profiles')
                    .select('pro_expires_at, pro_tier, full_name')
                    .eq('id', session.user.id)
                    .single();
                
                if (profile && profile.pro_expires_at) {
                    const expiry = new Date(profile.pro_expires_at);
                    const isPremium = expiry > new Date();
                    
                    this.state.isPremium = isPremium;
                    this.state.expiry = profile.pro_expires_at;
                    
                    if (isPremium) {
                        // Authoritative: Use stored pro_tier if valid and non-Spark
                        if (profile.pro_tier && profile.pro_tier !== 'Spark') {
                            this.state.tier = profile.pro_tier;
                        } else {
                            // Backwards-compatible fallback inference for legacy records
                            const now = new Date();
                            const diffMs = expiry.getTime() - now.getTime();
                            const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30.4375);
                            
                            if (diffMonths > 600) { // > 50 years
                                this.state.tier = 'Diamond';
                            } else if (diffMonths > 9) { // ~ 12 months
                                this.state.tier = 'Gold';
                            } else if (diffMonths > 4.5) { // ~ 6 months
                                this.state.tier = 'Silver';
                            } else { // ~ 3 months
                                this.state.tier = 'Bronze';
                            }
                        }
                    } else {
                        this.state.tier = 'Spark';
                    }
                    this.state.userName = profile.full_name || session.user.email.split('@')[0];
                    
                    this.updateUIAfterStateChange();
                    return;
                }
            }
        } catch (e) {
            console.error("Failed to load license state from Supabase:", e);
        }

        const savedToken = App.settings.get('licenseToken');
        if (savedToken) {
            try {
                const payload = JSON.parse(atob(savedToken.split('.')[1]));
                if (new Date(payload.expiry) > new Date()) {
                    this.state.token = savedToken;
                    this.state.isPremium = payload.isPremium;
                    this.state.tier = payload.tier;
                    this.state.userName = payload.userName;
                    this.state.expiry = payload.expiry;
                } else {
                    App.ui.showToast('Your premium license has expired.', 'warning');
                    await App.settings.set('licenseToken', null);
                }
            } catch (e) {
                console.error("Error parsing license token:", e);
                await App.settings.set('licenseToken', null);
            }
        }
        this.updateUIAfterStateChange();
    },

    updateUIAfterStateChange() {
        const badgeInfo = { Spark: { icon: '✨', name: 'Spark', color: '#B0BEC5' }, Bronze: { icon: '🥉', name: 'Bronze', color: '#CD7F32' }, Silver: { icon: '🥈', name: 'Silver', color: '#C0C0C0' }, Gold: { icon: '🥇', name: 'Gold', color: '#FFD700' }, Diamond: { icon: '💎', name: 'Diamond', color: '#B9F2FF' } };
        const currentTier = badgeInfo[this.state.tier] || badgeInfo.Spark;
        const isPremium = this.isPremium();

        const profileBadge = document.getElementById('profile-badge');
        if (profileBadge) {
            // Replace the simple text content with our new rich HTML badge
            profileBadge.innerHTML = App.util.getTierBadgeHTML(this.state.tier, 36);
            profileBadge.title = `Your Current Tier: ${currentTier.name}`;
        }

        document.querySelectorAll('.premium-feature-locked').forEach(el => {
            if (isPremium) {
                el.classList.remove('premium-feature-locked');
                if (el.dataset.originalTitle) {
                    el.title = el.dataset.originalTitle;
                }
            } else {
                el.classList.add('premium-feature-locked');
                if (!el.dataset.originalTitle) {
                    el.dataset.originalTitle = el.title;
                }
                el.title = 'This is a Premium feature. Upgrade to unlock.';
            }
        });
        App.ui.updateHeaderState();
        const activeViewId = App.router.getActiveView();
        if (activeViewId === 'flashcard') App.ui.filterAndRenderFlashcards();
        if (activeViewId === 'library') App.ui.filterAndRenderArticles();
    }
};
