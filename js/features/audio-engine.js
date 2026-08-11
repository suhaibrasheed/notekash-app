// ==========================================================================
// NoteKash - js/features/audio-engine.js
// Phase 5 Extraction: Audio Recording + Transcription + Player Engine
//
// ZERO REGRESSION POLICY: This is an exact copy of the logic from
// golden/NoteKash-v8.248c.html. No logic has been rewritten. All property
// names, method signatures, and behavior are identical to the original.
//
// IMPORTANT COUPLING NOTE:
// App.audio.initializePlayersIn() is called during article read-mode rendering
// (it wires up audio player UI for embedded recordings). The main.js stub must
// define a safe no-op for initializePlayersIn so that article rendering never
// throws if the real module hasn't loaded yet.
//
// Depends on: App.state, App.ui, App.settings, App.util
// via global window.App — available at call-time.
// ==========================================================================

export const audio = {
                isRecording: false,
                isTranscribing: false,
                recorder: null,
                transcriptionWorker: null,
                audioChunks: [],
                activePlayer: null,
                transcriptionToasts: new Map(),
                audioContext: null,
                analyser: null,
                animationFrameId: null,
                recordingToast: null,
                modelDB: null,

                activeStream: null,

                async init() {
                    try {
                        const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1');
                    } catch (e) { console.warn("Could not preload transcription library.") }
                    await this.openModelDB();
                },

                async openModelDB() {
                    return new Promise((resolve, reject) => {
                        const request = indexedDB.open('WhisperModelsDB', 1);
                        request.onerror = (e) => { console.error("IndexedDB error:", e); reject("DB Error"); };
                        request.onsuccess = (e) => { this.modelDB = e.target.result; resolve(); };
                        request.onupgradeneeded = (e) => { e.target.result.createObjectStore('models', { keyPath: 'id' }); };
                    });
                },

                async saveModel(id, data) {
                    if (!this.modelDB) await this.openModelDB();
                    return new Promise((resolve, reject) => {
                        const transaction = this.modelDB.transaction(['models'], 'readwrite');
                        const store = transaction.objectStore('models');
                        const request = store.put({ id, data });
                        request.onsuccess = () => resolve();
                        request.onerror = (e) => { console.error("Failed to save model to DB", e); reject("Save Error"); };
                    });
                },

                async getModel(id) {
                    if (!this.modelDB) await this.openModelDB();
                    return new Promise((resolve) => {
                        const transaction = this.modelDB.transaction(['models'], 'readonly');
                        const store = transaction.objectStore('models');
                        const request = store.get(id);
                        request.onsuccess = (e) => resolve(e.target.result ? e.target.result.data : null);
                        request.onerror = () => resolve(null);
                    });
                },

                async deleteTranscriptionModels() {
                    if (!this.modelDB) await this.openModelDB();
                    return new Promise((resolve) => {
                        const transaction = this.modelDB.transaction(['models'], 'readwrite');
                        const store = transaction.objectStore('models');
                        store.clear().onsuccess = async () => {
                            await App.settings.set('transcriptionModel', null);
                            this.updateModelStatusUI();
                            App.ui.showToast('Offline models deleted.', 'info');
                            resolve();
                        };
                    });
                },

                async downloadTranscriptionModel(modelId) {
                    const btn = document.getElementById(`download-model-${modelId.split('-')[1]}`);
                    if (btn) {
                        btn.textContent = 'Preparing...';
                        btn.disabled = true;
                    }
                    if (!App.offline.check('Voice Typing')) return;
                    try {
                        const { pipeline, env } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1');
                        await pipeline('automatic-speech-recognition', modelId, {
                            progress_callback: (progress) => {
                                if (!btn) return;
                                let progressText = progress.file ? progress.file.split('.')[0] : 'Initializing';
                                if (typeof progress.progress === 'number') {
                                    progressText += `: ${progress.progress.toFixed(0)}%`;
                                }
                                btn.textContent = progressText;
                            }
                        });
                        await App.settings.set('transcriptionModel', modelId);
                        App.ui.showToast(`Model "${modelId.split('/')[1]}" is ready!`, { type: 'success' });
                    } catch (e) {
                        console.error("Model download failed", e);
                        App.ui.showToast('Model download failed. Check console.', 'error');
                    } finally {
                        this.updateModelStatusUI();
                    }
                },

                async updateModelStatusUI() {
                    const statusEl = document.getElementById('transcription-model-status');
                    const deleteBtn = document.getElementById('delete-models-btn');
                    const selectedModel = App.settings.get('transcriptionModel');
                    if (statusEl) {
                        statusEl.textContent = selectedModel ? `Selected: ${selectedModel.split('/')[1]}` : 'No model selected.';
                    }
                    document.querySelectorAll('[id^="download-model-"]').forEach(btn => {
                        const modelId = `Xenova/whisper-${btn.id.split('-')[2]}`;
                        if (modelId === selectedModel) {
                            btn.textContent = 'Selected';
                            btn.disabled = true;
                            btn.classList.remove('btn-secondary');
                            btn.classList.add('btn-primary');
                        } else {
                            btn.textContent = 'Select';
                            btn.disabled = false;
                            btn.classList.remove('btn-primary');
                            btn.classList.add('btn-secondary');
                        }
                    });
                    if (deleteBtn) {
                        deleteBtn.style.display = selectedModel ? 'inline-flex' : 'none';
                    }
                },

                async toggleRecording() {
                    if (this.isRecording) {
                        this.stopRecording();
                    } else {
                        await this.startRecording();
                    }
                },

                async startRecording() {
                    if (this.isRecording) return;
                    const modelName = App.settings.get('transcriptionModel');
                    this.isTranscribing = !!modelName;

                    const stream = await this.requestPermission();
                    if (!stream) return;

                    this.activeStream = stream;
                    this.isRecording = true;
                    this.audioChunks = [];
                    this.recorder = new MediaRecorder(stream, { audioBitsPerSecond: App.settings.get('audioBitrate') });

                    this.recorder.addEventListener("stop", async () => {
                        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            this.insertPlayer(reader.result, crypto.randomUUID());
                        };
                        reader.readAsDataURL(audioBlob);
                    });

                    this.recorder.addEventListener("dataavailable", event => this.audioChunks.push(event.data));
                    this.recorder.start();
                    this._startVisualizer(stream);

                    const articleForControls = App.storage.getArticle(App.state.activeArticleId) || { category: 'General' };
                    App.ui.renderArticleControls(articleForControls);

                    // THE FIX: Create a beautiful, animated toast message instead of static text.
                    const toastMessageHTML = `
                    <div class="toast-wave-container">
                        <div class="toast-wave-visualizer">
                            <div class="wave-bar"></div>
                            <div class="wave-bar"></div>
                            <div class="wave-bar"></div>
                            <div class="wave-bar"></div>
                        </div>
                        <span>Recording...</span>
                    </div>`;
                    this.recordingToast = App.ui.showToast(toastMessageHTML, { type: 'info', duration: 0 });
                },

                stopRecording() {
                    if (!this.isRecording && !this.activeStream) return;
                    if (this.recorder && this.recorder.state !== 'inactive') {
                        try { this.recorder.stop(); } catch (e) { console.warn(e); }
                    }
                    this.isRecording = false;
                    this._stopVisualizer();

                    // Release all hardware microphone tracks immediately
                    if (this.activeStream) {
                        this.activeStream.getTracks().forEach(track => {
                            try { track.stop(); } catch (e) {}
                        });
                        this.activeStream = null;
                    }
                    if (this.recorder && this.recorder.stream) {
                        this.recorder.stream.getTracks().forEach(track => {
                            try { track.stop(); } catch (e) {}
                        });
                    }

                    const articleForControls = App.state.activeArticleId === 'temp_new_article'
                        ? { category: 'General', readCount: 0, tags: [] }
                        : App.storage.getArticle(App.state.activeArticleId);
                    App.ui.renderArticleControls(articleForControls);

                    if (this.recordingToast) App.ui.hideToast(this.recordingToast);
                    this.recordingToast = null;
                },

                runTranscription(audioData, modelName, transcriptionId) {
                    if (this.transcriptionWorker) {
                        this.transcriptionWorker.terminate();
                    }

                    const workerBlob = new Blob([document.getElementById('transcription-worker-script').textContent], { type: 'application/javascript' });
                    const workerUrl = URL.createObjectURL(workerBlob);

                    // **THIS IS THE FIX**: We create the worker as a 'module' so it can use `import`.
                    this.transcriptionWorker = new Worker(workerUrl, { type: 'module' });

                    const transcribingToast = App.ui.showToast('Transcribing...', { type: 'info', duration: 0 });
                    this.transcriptionToasts.set(transcriptionId, transcribingToast);

                    this.transcriptionWorker.onmessage = (event) => {
                        const { status, text, data, playerId: returnedId } = event.data;
                        const toastToHide = this.transcriptionToasts.get(returnedId);
                        if (toastToHide) {
                            App.ui.hideToast(toastToHide);
                            this.transcriptionToasts.delete(returnedId);
                        }
                        if (status === 'complete') {
                            this.insertTranscriptionAsTile(text, returnedId);
                        } else if (status === 'error') {
                            App.ui.showToast(`Transcription failed: ${data}`, { type: 'error' });
                        }
                        this.transcriptionWorker.terminate();
                        this.transcriptionWorker = null;
                    };

                    this.transcriptionWorker.onerror = (e) => {
                        console.error('Worker error:', e);
                        const toastToHide = this.transcriptionToasts.get(transcriptionId);
                        if (toastToHide) App.ui.hideToast(toastToHide);
                        App.ui.showToast('A critical worker error occurred.', 'error');
                    };

                    this.transcriptionWorker.postMessage({ audioData, modelName, playerId: transcriptionId });
                },

                insertTranscriptionAsTile(text, transcriptionId) {
                    if (!text || !text.trim() || !transcriptionId) return;
                    navigator.clipboard.writeText(text.trim()).then(() => {
                        App.ui.showToast('Transcription complete & copied!', { type: 'success' });
                    });
                    const tileHTML = `<div class="nk-text-tile color-default" contenteditable="false" data-color="default">
                    <span class="nk-text-tile-icon">🎙️</span>
                    <div class="nk-text-tile-color-cycler" title="Cycle Color"><i class="fa-solid fa-palette fa-xs"></i></div>
                    <div class="nk-text-tile-content" contenteditable="true">${App.util.escapeHtml(text.trim())}</div>
                </div>`;

                    const placeholderContainer = document.getElementById(transcriptionId);
                    if (placeholderContainer) {
                        placeholderContainer.outerHTML = tileHTML;
                    } else {
                        console.warn("Could not find transcription placeholder container for ID:", transcriptionId);
                        // Fallback just in case, inserts at the end of the article.
                        document.getElementById('article-content').insertAdjacentHTML('beforeend', tileHTML + '<p><br></p>');
                    }
                    App.state.isArticleDirty = true;
                },

                insertPlayer(base64Url, transcriptionId) {
                    const playerId = `audio-player-${transcriptionId}`;

                    const transcribeButtonHTML = `
                    <div class="nk-transcribe-container" id="transcribe-container-${transcriptionId}">
                    <button class="btn btn-secondary btn-gradient-text">Transcribe Audio</button>
                    </div>`;

                    const playerHTML = `
                    <div class="nk-audio-block">
                        <div class="nk-audio-player" id="${playerId}" contenteditable="false">
                            <button class="audio-play-pause-btn" aria-label="Play"></button>
                            <div class="audio-progress-bar-container">
                                <input type="range" class="audio-progress-bar" value="0" min="0" max="100" step="0.1">
                            </div>
                            <div class="audio-time-display">0:00 / 0:00</div>
                            <button class="btn btn-secondary audio-speed-btn" data-speed="1" title="Playback Speed">1x</button>
                            <audio src="${base64Url}" preload="metadata" data-speed="1"></audio>
                        </div>
                        ${transcribeButtonHTML}
                    </div>`;

                    App.util.insertGuardianBlock(playerHTML);

                    setTimeout(() => {
                        const newPlayer = document.getElementById(playerId);
                        if (newPlayer) this._initializeSinglePlayer(newPlayer);
                    }, 100);
                    App.state.isArticleDirty = true;
                },

                initializePlayersIn(container) {
                    // Optimization: Use getElementsByClassName (faster) and check length before looping
                    const players = container.getElementsByClassName('nk-audio-player');
                    if (players.length === 0) return;
                    Array.from(players).forEach(player => { if (player.dataset.initialized) return; this._initializeSinglePlayer(player); });
                },

                _initializeSinglePlayer(player) {
                    const audio = player.querySelector('audio'); const playPauseBtn = player.querySelector('.audio-play-pause-btn'); const progressBar = player.querySelector('.audio-progress-bar'); const timeDisplay = player.querySelector('.audio-time-display');
                    if (!audio || !playPauseBtn || !progressBar || !timeDisplay) return;
                    const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
                    const updateDisplay = () => { if (!audio.duration) return; progressBar.value = audio.currentTime; timeDisplay.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration || 0)}`; };
                    playPauseBtn.classList.remove('playing');
                    audio.addEventListener('loadedmetadata', () => { progressBar.max = audio.duration; updateDisplay(); });
                    audio.addEventListener('timeupdate', updateDisplay);
                    audio.addEventListener('play', () => { playPauseBtn.classList.add('playing'); this.activePlayer = audio; });
                    audio.addEventListener('pause', () => { playPauseBtn.classList.remove('playing'); if (this.activePlayer === audio) this.activePlayer = null; });
                    audio.addEventListener('ended', () => { playPauseBtn.classList.remove('playing'); audio.currentTime = 0; updateDisplay(); if (this.activePlayer === audio) this.activePlayer = null; });
                    progressBar.addEventListener('input', () => { audio.currentTime = progressBar.value; updateDisplay(); });
                    player.dataset.initialized = 'true';
                },

                async transcribeAudioBlock(buttonEl) {
                    const container = buttonEl.parentElement;
                    const audioPlayer = container.previousElementSibling;
                    if (!audioPlayer || !audioPlayer.classList.contains('nk-audio-player')) {
                        App.ui.showToast("Could not find the associated audio player.", 'error');
                        return;
                    }

                    const audioEl = audioPlayer.querySelector('audio');
                    const modelName = App.settings.get('transcriptionModel');
                    if (!audioEl || !audioEl.src || !modelName) {
                        App.ui.showToast("Audio source or transcription model not found.", 'error');
                        return;
                    }

                    // Show feedback to the user immediately
                    container.innerHTML = `<p id="${container.id}" class="transcript-placeholder" style="color:var(--text-secondary); font-style:italic;">Transcribing, wait for a moment ...</p>`;

                    let audioContext = null;
                    try {
                        // Convert the base64 data URL back into an ArrayBuffer the AI can use
                        const audioBlob = App.util.dataURLtoBlob(audioEl.src);
                        if (!audioBlob) throw new Error("Could not convert audio data.");

                        const arrayBuffer = await audioBlob.arrayBuffer();
                        // Use a temporary AudioContext for this one-off task
                        audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
                        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                        const audioDataForTranscription = audioBuffer.getChannelData(0);

                        // The container's ID is our unique key for this transcription job
                        const transcriptionId = container.id;
                        this.runTranscription(audioDataForTranscription, modelName, transcriptionId);

                    } catch (error) {
                        console.error("Error preparing audio for transcription:", error);
                        App.ui.showToast("Failed to process audio for transcription.", 'error');
                        // Restore the button if processing fails
                        container.innerHTML = `<button class="btn btn-secondary" onclick="App.audio.transcribeAudioBlock(this)">Transcribe Audio</button>`;
                    } finally {
                        if (audioContext && audioContext.state !== 'closed') {
                            try { audioContext.close(); } catch (e) {}
                        }
                    }
                },

                handlePlayPause(button) {
                    const player = button.closest('.nk-audio-player'); if (!player) return; const audio = player.querySelector('audio');
                    if (this.activePlayer && this.activePlayer !== audio) this.activePlayer.pause();
                    if (audio.paused) audio.play(); else audio.pause();
                },

                // NEW FUNCTION
                handleSpeedChange(button) {
                    const player = button.closest('.nk-audio-player');
                    if (!player) return;
                    const audio = player.querySelector('audio');
                    if (!audio) return;

                    const speeds = [1, 1.25, 1.5, 1.75, 2];
                    const currentSpeed = parseFloat(button.dataset.speed || "1");
                    const currentIndex = speeds.indexOf(currentSpeed);
                    const nextIndex = (currentIndex + 1) % speeds.length;
                    const newSpeed = speeds[nextIndex];

                    audio.playbackRate = newSpeed;
                    button.dataset.speed = newSpeed;
                    button.textContent = `${newSpeed}x`;
                    button.title = `Playback Speed: ${newSpeed}x`;
                },

                async requestPermission() {
                    try { if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('InsecureContext'); return await navigator.mediaDevices.getUserMedia({ audio: true }); }
                    catch (err) { let msg = 'An unknown error occurred.'; if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') msg = 'Microphone permission was denied.'; else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') msg = 'No microphone was found on this device.'; else if (err.message === 'InsecureContext') msg = 'Microphone access requires a secure (https:// or localhost) connection.'; App.ui.showToast(msg, 'error'); console.error("Mic error:", err.name, err.message); return null; }
                },

                _startVisualizer(stream) {
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)(); this.analyser = this.audioContext.createAnalyser(); const source = this.audioContext.createMediaStreamSource(stream); source.connect(this.analyser); this.analyser.fftSize = 256; const bufferLength = this.analyser.frequencyBinCount; const dataArray = new Uint8Array(bufferLength); const canvas = document.getElementById('recording-visualizer-canvas'); if (!canvas) return; const canvasCtx = canvas.getContext('2d');
                    const draw = () => { this.animationFrameId = requestAnimationFrame(draw); this.analyser.getByteTimeDomainData(dataArray); canvasCtx.clearRect(0, 0, canvas.width, canvas.height); canvasCtx.lineWidth = 2; canvasCtx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--danger-color'); canvasCtx.beginPath(); const sliceWidth = canvas.width * 1.0 / bufferLength; let x = 0; for (let i = 0; i < bufferLength; i++) { const v = dataArray[i] / 128.0; const y = v * canvas.height / 2; if (i === 0) canvasCtx.moveTo(x, y); else canvasCtx.lineTo(x, y); x += sliceWidth; } canvasCtx.lineTo(canvas.width, canvas.height / 2); canvasCtx.stroke(); }; draw();
                },

                _stopVisualizer() {
                    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId); if (this.audioContext) this.audioContext.close(); this.animationFrameId = null; this.audioContext = null; const canvas = document.getElementById('recording-visualizer-canvas'); if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
                },

                cleanup() {
                    if (this.isRecording) {
                        this.stopRecording();
                    }
                    if (this.activeStream) {
                        this.activeStream.getTracks().forEach(t => { try { t.stop(); } catch (e) {} });
                        this.activeStream = null;
                    }
                    this._stopVisualizer();
                    if (this.activePlayer) {
                        try { this.activePlayer.pause(); } catch (e) {}
                        this.activePlayer = null;
                    }
                    if (this.transcriptionWorker) {
                        try { this.transcriptionWorker.terminate(); } catch (e) {}
                        this.transcriptionWorker = null;
                    }
                }
};
