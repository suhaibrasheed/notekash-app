export class InteractiveCursorSplash {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'interactive-cursor-splash';
        this.ctx = this.canvas.getContext('2d', { alpha: true });
        this.particles = [];
        this.lastSpawnTime = 0;
        this.threshold = 20;
        this.primaryColor = '#ffffff';
        this.isRunning = false;

        Object.assign(this.canvas.style, {
            position: 'fixed',
            top: '0', left: '0',
            width: '100vw', height: '100vh',
            pointerEvents: 'none',
            zIndex: '999999',
            display: 'none'
        });

        document.body.appendChild(this.canvas);
        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e), { passive: true, capture: true });
        window.addEventListener('mousedown', (e) => this.handleMouseClick(e), { passive: true, capture: true });
    }

    startLoop() {
        if (this.isRunning) return;
        this.isRunning = true;
        requestAnimationFrame(() => this.loop());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    updateColor() {
        const rootStyle = getComputedStyle(document.documentElement);
        const bodyStyle = getComputedStyle(document.body);

        let p = bodyStyle.getPropertyValue('--primary-color').trim() ||
            rootStyle.getPropertyValue('--primary-color').trim();

        if (p) {
            this.primaryColor = p;
        }
    }

    // Safely parse colors into RGBA for smooth gradients and opacities
    getRGBA(colorStr, alpha) {
        this.ctx.fillStyle = colorStr;
        let normalized = this.ctx.fillStyle;
        if (normalized.startsWith('#')) {
            let r = parseInt(normalized.slice(1, 3), 16);
            let g = parseInt(normalized.slice(3, 5), 16);
            let b = parseInt(normalized.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } else if (normalized.startsWith('rgb')) {
            let vals = normalized.match(/\d+/g);
            if (vals && vals.length >= 3) {
                return `rgba(${vals[0]}, ${vals[1]}, ${vals[2]}, ${alpha})`;
            }
        }
        return colorStr;
    }

    handleMouseMove(e) {
        if (!document.body.classList.contains('is-pro-presenter-active')) {
            this.canvas.style.display = 'none';
            if (this.particles.length > 0) {
                this.particles = [];
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
            this.isRunning = false;
            return;
        }
        this.canvas.style.display = 'block';

        const x = e.clientX, y = e.clientY, w = this.canvas.width, h = this.canvas.height, t = this.threshold;
        let nx = 0, ny = 0;

        // Determine which border the cursor is touching
        if (x <= t) nx = 1; else if (x >= w - t) nx = -1;
        if (y <= t) ny = 1; else if (y >= h - t) ny = -1;

        if (nx !== 0 || ny !== 0) {
            const now = performance.now();
            // 40ms throttle for smooth, continuous bubble trails
            if (now - this.lastSpawnTime > 40) {
                this.updateColor();
                this.spawnParticles(x, y, nx, ny);
                this.lastSpawnTime = now;
            }
        }
    }

    handleMouseClick(e) {
        if (!document.body.classList.contains('is-pro-presenter-active')) return;

        const cx = e.clientX;
        const cy = e.clientY;

        // Loop backwards so we can safely pop bubbles without skipping elements
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];

            // High-performance squared distance check (no Math.sqrt)
            let dx = cx - p.x;
            let dy = cy - p.y;

            // Generous hit radius so users don't have to be pixel-perfect
            if (dx * dx + dy * dy <= (p.size + 20) * (p.size + 20)) {
                // Burst! Remove the original bubble
                this.particles.splice(i, 1);

                // Release more droplets for larger bubbles (Performance-friendly scaling)
                const droplets = Math.floor(p.size * 0.4 + 4 + Math.random() * 2);
                for (let j = 0; j < droplets; j++) {
                    const angle = Math.random() * Math.PI * 2;
                    // Gentle burst speed for a natural, beautiful splash
                    const spd = 1.5 + Math.random() * 2.5;
                    this.particles.push({
                        x: p.x, y: p.y,
                        vx: Math.cos(angle) * spd,
                        vy: Math.sin(angle) * spd,
                        size: 1.5 + Math.random() * 2.5, // smaller, nicer delicate droplets
                        fillColor: p.fillColor,
                        strokeColor: p.strokeColor,
                        wobble: 0,
                        wobbleSpeed: 0,
                        wobbleAmp: 0,
                        floatX: 0,
                        floatY: 0,
                        isDroplet: true // Mark for special high-performance droplet rendering
                    });
                }

                this.startLoop();
                // Break after bursting one to avoid bursting overlapping ones
                break;
            }
        }
    }

    spawnParticles(x, y, nx, ny) {
        // 1-2 bubbles per tick to avoid clutter and overlaps
        const count = 1 + Math.floor(Math.random() * 2);

        // Pre-calculate colors once per spawn for maximum rendering speed
        const fillColor = this.getRGBA(this.primaryColor, 0.15);
        const strokeColor = this.getRGBA(this.primaryColor, 0.7);

        for (let i = 0; i < count; i++) {
            // Strong push away from the border deep into the screen
            const pushX = nx === 0 ? (Math.random() - 0.5) : nx + (Math.random() - 0.5) * 0.8;
            const pushY = ny === 0 ? (Math.random() - 0.5) : ny + (Math.random() - 0.5) * 0.8;

            // Higher initial speed to push bubbles nicely toward the center first
            const speed = 4 + Math.random() * 5;

            // Give each bubble a permanent "drift direction" so they spread out organically
            const floatAngle = (Math.random() * Math.PI) + Math.PI * 0.8; // Generally biased upward/outward
            const floatX = Math.cos(floatAngle) * (0.02 + Math.random() * 0.05);
            const floatY = Math.sin(floatAngle) * (0.02 + Math.random() * 0.05);

            // 1 in 60 chance for a majestic, large bubble (Dopamine hit!)
            const isGiant = Math.random() < 0.0166;
            const size = isGiant ? (30 + Math.random() * 35) : (3 + Math.random() * 14);

            this.particles.push({
                x: x, y: y,
                vx: pushX * speed * (isGiant ? 0.6 : 1), // Giant bubbles move a bit slower initially
                vy: pushY * speed * (isGiant ? 0.6 : 1),
                size: size,
                fillColor: fillColor,
                strokeColor: strokeColor,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: isGiant ? 0.02 : (0.04 + Math.random() * 0.06), // Giant bubbles wobble slowly
                wobbleAmp: isGiant ? 0.5 : (0.5 + Math.random() * 1.5),
                floatX: floatX * (isGiant ? 0.4 : 1), // Giant bubbles drift gracefully slowly
                floatY: floatY * (isGiant ? 0.4 : 1)
            });
        }

        this.startLoop();
    }

    loop() {
        if (!this.isRunning) return;

        if (!document.body.classList.contains('is-pro-presenter-active') || this.particles.length === 0) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.particles = [];
            this.isRunning = false;
            return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.lineCap = 'round';

        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];

            if (p.isDroplet) {
                // Natural, gentle falling effect like a dream
                p.vx *= 0.96; // Air resistance on X slows horizontal burst
                p.vy += 0.05; // Very gentle gravity for a slow, natural fall
                p.vy *= 0.98; // Air resistance on Y
            } else {
                // Physics: Friction smoothly slows down the initial "push" into the screen
                p.vx *= 0.94;
                p.vy *= 0.94;

                // Continuous personalized drift causes bubbles to naturally spread out across the whole screen
                p.vx += p.floatX;
                p.vy += p.floatY;

                // Gentle wobble like real bubbles underwater
                p.x += Math.sin(p.wobble) * p.wobbleAmp;
                p.wobble += p.wobbleSpeed;
            }

            p.x += p.vx;
            p.y += p.vy;

            // Remove if completely off-screen, or if a droplet shrinks away completely
            if (p.size <= 0.5 || p.y < -p.size || p.x < -p.size || p.x > this.canvas.width + p.size || p.y > this.canvas.height + p.size) {
                this.particles.splice(i, 1);
                continue;
            }

            if (p.isDroplet) {
                // Render as beautiful tiny mini-bubbles instead of solid dots
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

                this.ctx.fillStyle = p.fillColor;
                this.ctx.fill();

                this.ctx.lineWidth = 1;
                this.ctx.strokeStyle = p.strokeColor;
                this.ctx.stroke();

                // Droplets just naturally fall completely off screen!
            } else {
                // Render beautiful clean Bubble
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

                // Transparent interior
                this.ctx.fillStyle = p.fillColor;
                this.ctx.fill();

                // Solid elegant rim
                this.ctx.lineWidth = 1.8;
                this.ctx.strokeStyle = p.strokeColor;
                this.ctx.stroke();

                // Specular highlight (a small white arc reflecting light on the top right)
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size * 0.65, Math.PI * 1.3, Math.PI * 1.7);
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
                this.ctx.lineWidth = 1.5;
                this.ctx.stroke();

                // Tiny secondary specular dot on the bottom left for extra 3D "cuteness"
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size * 0.65, Math.PI * 0.6, Math.PI * 0.75);
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
            }
        }

        if (this.particles.length > 0) {
            requestAnimationFrame(() => this.loop());
        } else {
            this.isRunning = false;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
}
