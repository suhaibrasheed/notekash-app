export const offline = {
    isOffline: false,
    onlineQueue: [],
    runWhenOnline(task) {
        if (!this.isOffline) {
            return Promise.resolve().then(task);
        }
        if (typeof task === 'function') this.onlineQueue.push(task);
        return null;
    },
    flushOnlineQueue() {
        const queue = this.onlineQueue.slice();
        this.onlineQueue.length = 0;
        return Promise.allSettled(queue.map(fn => {
            try {
                return fn();
            } catch (e) {
                console.error('Queued online task failed:', e);
                return null;
            }
        }));
    },
    init() {
        // 1. Inject CSS for the offline indicator (Minimal fix)
        const style = document.createElement('style');
        style.textContent = `
            #offline-indicator {
                display: none; 
                color: var(--danger-color, #ff6b6b);
                margin-right: 4px; /* Adjust spacing to match other icons */
            }
            #offline-indicator.is-visible {
                display: flex; /* btn-icon uses flex */
                animation: none; /* No pulse */
            }
            #offline-indicator svg {
                width: 20px;
                height: 20px;
            }
        `;
        document.head.appendChild(style);

        // 2. Create the indicator element using standard button structure
        this.el = document.createElement('button');
        this.el.className = 'btn-icon';
        this.el.id = 'offline-indicator';
        this.el.setAttribute('aria-label', 'Offline Mode');
        this.el.title = "Offline Mode - Cloud features paused";

        // SVG Icon: Cloud Off (Feather Icons)
        this.el.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22.61 16.95A5 5 0 0 0 18 10h-1.26a8 8 0 0 0-7.05-6M5 5a8 8 0 0 0 4 15h9a5 5 0 0 0 1.7-.3"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
        `;

        // 3. Inject into Header (before Settings button)
        const tryInject = () => {
            const headerActions = document.querySelector('.header-fixed-actions');
            const settingsBtn = document.getElementById('settings-btn');
            if (headerActions && settingsBtn) {
                headerActions.insertBefore(this.el, settingsBtn);
            } else {
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', tryInject);
                } else {
                    // Fallback
                    this.el.style.position = 'fixed';
                    this.el.style.bottom = '20px';
                    this.el.style.left = '20px';
                    this.el.style.zIndex = '1000';
                    document.body.appendChild(this.el);
                }
            }
        };
        tryInject();

        // 4. Add click handler
        this.el.addEventListener('click', () => {
            App.ui.showToast('You are Offline. Cloud features are paused.', { type: 'warning', duration: 3000 });
        });

        // 5. Status Check Logic
        const checkStatus = () => {
            this.isOffline = !navigator.onLine;
            document.body.classList.toggle('is-offline', this.isOffline);

            if (this.isOffline) {
                this.el.classList.add('is-visible');
                console.warn("App is OFFLINE. Disabling external libraries.");
            } else {
                this.el.classList.remove('is-visible');
            }
        };

        window.addEventListener('online', () => {
            checkStatus();
            App.ui.showToast('You are back online!', { type: 'success' });
            App.offline.flushOnlineQueue();
            if (App.settings.get('enableDropboxSync') && App.state.dropboxToken && App.dropbox.isReady()) App.dropbox.syncChanges(true);
        });
        window.addEventListener('offline', () => {
            checkStatus();
            App.ui.showToast('You are offline. Cloud features disabled.', { type: 'warning' });
        });

        // Initial Check
        checkStatus();
    },
    check(featureName = 'This feature') {
        if (!navigator.onLine) {
            App.ui.showToast(`${featureName} requires internet.`, { type: 'warning' });
            return false;
        }
        return true;
    },
    safeChart(ctx, config) {
        if (typeof Chart !== 'undefined') {
            try {
                const canvas = ctx.canvas || (ctx.tagName === 'CANVAS' ? ctx : null);
                if (!canvas) return new Chart(ctx, config);

                // Disconnect any existing observer on this canvas to prevent duplicate renderings
                if (canvas._chartObserver) {
                    canvas._chartObserver.disconnect();
                    delete canvas._chartObserver;
                }

                // Add smooth lively animation settings
                if (!config.options) config.options = {};
                if (!config.options.animation) {
                    config.options.animation = {
                        duration: 2000,
                        easing: 'easeOutQuart'
                    };
                }

                let chartInstance = null;
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            // Destroy the chart and recreate it to play the animation every time it comes into view
                            if (chartInstance) {
                                chartInstance.destroy();
                            } else if (Chart.getChart(canvas)) {
                                Chart.getChart(canvas).destroy();
                            }
                            try {
                                chartInstance = new Chart(ctx, config);
                            } catch (e) {
                                console.error("Chart delayed init error:", e);
                            }
                        }
                    });
                }, { threshold: 0.1 });

                observer.observe(canvas);
                canvas._chartObserver = observer;

                // Return a wrapper object with a destroy method to integrate smoothly with existing cleanup logic
                return {
                    destroy: () => {
                        observer.disconnect();
                        delete canvas._chartObserver;
                        if (chartInstance) {
                            chartInstance.destroy();
                        } else if (Chart.getChart(canvas)) {
                            Chart.getChart(canvas).destroy();
                        }
                    }
                };
            } catch (e) {
                console.error("Chart wrapper init error:", e);
                return null;
            }
        } else if (ctx) {
            const c = ctx;
            c.save();
            c.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-tertiary') || '#f0f0f0';
            c.fillRect(0, 0, c.canvas.width, c.canvas.height);
            c.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-secondary') || '#666';
            c.font = '14px sans-serif';
            c.textAlign = 'center';
            c.textBaseline = 'middle';
            c.fillText('Chart offline', c.canvas.width / 2, c.canvas.height / 2);
            c.restore();
        }
        return null;
    },
    safeFuse(list, options) {
        if (typeof Fuse !== 'undefined') {
            return new window.Fuse(list, options);
        }
        return {
            search: (query) => {
                if (!query) return [];
                const lowerQ = String(query).toLowerCase();
                const keys = options.keys || [];
                return list.map((item, index) => {
                    let match = false;
                    if (keys.length > 0) {
                        match = keys.some(k => {
                            const val = item[k];
                            return val && String(val).toLowerCase().includes(lowerQ);
                        });
                    } else {
                        match = String(item).toLowerCase().includes(lowerQ);
                    }
                    if (match) return { item: item, refIndex: index, score: 0.1 };
                    return null;
                }).filter(i => i !== null);
            }
        };
    }
};
