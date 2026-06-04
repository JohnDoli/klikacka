<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAudioStore } from '../stores/audio';

const emit = defineEmits<{ solved: []; dismissed: [] }>();
const audio = useAudioStore();

// All local images tagged by type
const crosswalkImages = [
    '/captcha/cross-walk1.jpg',
    '/captcha/cross-walk2.jpg',
    '/captcha/cross-walk3.jpg',
    '/captcha/cross-walk4.jpg',
    '/captcha/cross-walk5.jpg',
];
const trafficLightImages = [
    '/captcha/trafic-light1.jpg',
    '/captcha/trafic-light2.jpg',
    '/captcha/trafic-light3.jpg',
    '/captcha/trafic-light4.jpg',
];

interface Cell {
    url: string;
    correct: boolean;
}

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function makePuzzle(targetType: 'crosswalks' | 'traffic lights'): { label: string; cells: Cell[] } {
    const [correct, decoy] = targetType === 'crosswalks'
        ? [crosswalkImages, trafficLightImages]
        : [trafficLightImages, crosswalkImages];

    // Pick 3–4 correct images, fill rest with decoys to make 9
    const correctPicked = shuffle(correct).slice(0, Math.min(correct.length, 4));
    const decoyPicked   = shuffle(decoy).slice(0, 9 - correctPicked.length);

    // If we don't have enough unique decoys, repeat some
    while (decoyPicked.length < 9 - correctPicked.length) {
        decoyPicked.push(...shuffle(decoy).slice(0, 9 - correctPicked.length - decoyPicked.length));
    }

    const cells: Cell[] = [
        ...correctPicked.map(url => ({ url, correct: true })),
        ...decoyPicked.map(url => ({ url, correct: false })),
    ];

    return { label: targetType, cells: shuffle(cells) };
}

function newPuzzle() {
    const type = Math.random() < 0.5 ? 'crosswalks' : 'traffic lights';
    return makePuzzle(type as 'crosswalks' | 'traffic lights');
}

const puzzle = ref(newPuzzle());
const selected = ref<Set<number>>(new Set());
const shake = ref(false);
const verifying = ref(false);
const solved = ref(false);
const tryAgain = ref(false);

function toggleImage(idx: number) {
    if (verifying.value || solved.value) return;
    const s = new Set(selected.value);
    s.has(idx) ? s.delete(idx) : s.add(idx);
    selected.value = s;
    tryAgain.value = false;
}

const correctIndices = computed(() =>
    puzzle.value.cells.map((c, i) => c.correct ? i : -1).filter(i => i !== -1)
);

function verify() {
    if (verifying.value || solved.value) return;
    verifying.value = true;

    const sel  = [...selected.value].sort().join(',');
    const corr = [...correctIndices.value].sort().join(',');

    setTimeout(() => {
        verifying.value = false;
        if (sel === corr) {
            solved.value = true;
            audio.playSfx('correct');
            setTimeout(() => emit('solved'), 900);
        } else {
            tryAgain.value = true;
            shake.value = true;
            setTimeout(() => shake.value = false, 500);
            setTimeout(() => {
                puzzle.value = newPuzzle();
                selected.value = new Set();
                tryAgain.value = false;
            }, 1200);
        }
    }, 500);
}

function refresh() {
    puzzle.value = newPuzzle();
    selected.value = new Set();
    tryAgain.value = false;
}
</script>

<template>
    <div class="captcha-modal-overlay">
        <div class="img-captcha" :class="{ shake, solved }">
            <!-- Header -->
            <div class="img-captcha-header">
                <div class="select-all">Select all images with</div>
                <div class="category">{{ puzzle.label }}</div>
                <div class="click-verify">Click verify once there are none left.</div>
            </div>

            <!-- Grid -->
            <div class="img-captcha-grid">
                <div
                    v-for="(cell, idx) in puzzle.cells"
                    :key="idx"
                    class="img-cell"
                    :class="{ selected: selected.has(idx), 'reveal-correct': solved && cell.correct }"
                    @click="toggleImage(idx)"
                >
                    <img :src="cell.url" :alt="`image ${idx + 1}`" draggable="false" />
                    <div class="img-check">
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="img-captcha-footer">
                <div class="footer-icons">
                    <button class="icon-btn" @click="refresh" title="New challenge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                        </svg>
                    </button>
                    <button class="icon-btn" title="Audio">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                            <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
                            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
                        </svg>
                    </button>
                    <button class="icon-btn" title="Help">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="16" x2="12" y2="12"/>
                            <line x1="12" y1="8" x2="12.01" y2="8"/>
                        </svg>
                    </button>
                </div>

                <div class="recaptcha-brand">
                    <svg viewBox="0 0 64 64" width="32" height="32">
                        <circle cx="32" cy="32" r="30" fill="#4a90d9"/>
                        <path fill="white" d="M32 12 A20 20 0 1 1 12 32 L20 32 A12 12 0 1 0 32 20 Z"/>
                        <polygon fill="white" points="8,28 16,20 16,36"/>
                    </svg>
                    <div class="brand-text">
                        <div style="font-weight:bold;font-size:11px;color:#555;">reCAPTCHA</div>
                        <div style="font-size:9px;color:#aaa;">Privacy · Terms</div>
                    </div>
                </div>

                <div class="footer-right">
                    <div v-if="tryAgain" class="try-again">Please try again.</div>
                    <button
                        class="verify-btn"
                        :class="{ verifying, solved }"
                        @click="verify"
                        :disabled="verifying || solved"
                    >
                        {{ solved ? '✓' : verifying ? '...' : 'VERIFY' }}
                    </button>
                </div>
            </div>

            <!-- Solved overlay -->
            <Transition name="fade">
                <div v-if="solved" class="solved-overlay">
                    <svg viewBox="0 0 52 52" class="solved-check">
                        <circle cx="26" cy="26" r="25" fill="none" stroke="#4285f4" stroke-width="2"/>
                        <path fill="none" stroke="#4285f4" stroke-width="3" d="M14 27 l8 8 l16-16"/>
                    </svg>
                    <div class="solved-text">+10% bonus!</div>
                </div>
            </Transition>
        </div>
    </div>
</template>

<style scoped>
.captcha-modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.65);
    display: flex; align-items: center; justify-content: center;
    z-index: 2000;
}
.img-captcha {
    background: white;
    border-radius: 4px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    width: 310px;
    overflow: hidden;
    position: relative;
    font-family: 'Roboto', 'Arial', sans-serif;
    user-select: none;
}
.img-captcha-header {
    background: #4a90d9;
    padding: 14px 16px 12px;
    color: white;
}
.select-all  { font-size: 13px; font-weight: 400; }
.category    { font-size: 22px; font-weight: 700; line-height: 1.2; }
.click-verify{ font-size: 12px; opacity: 0.9; margin-top: 2px; }

.img-captcha-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 3px;
    padding: 3px;
    background: #ccc;
}
.img-cell {
    position: relative;
    aspect-ratio: 1;
    cursor: pointer;
    overflow: hidden;
    background: #ddd;
}
.img-cell img {
    width: 100%; height: 100%;
    object-fit: cover; display: block;
    transition: filter 0.15s;
    pointer-events: none;
}
.img-cell.selected img         { filter: brightness(0.72); }
.img-cell.selected             { outline: 3px solid #4a90d9; outline-offset: -3px; }
.img-cell.reveal-correct       { outline: 3px solid #34a853; outline-offset: -3px; }

.img-check {
    position: absolute; top: 6px; left: 6px;
    width: 22px; height: 22px;
    background: #4a90d9; border-radius: 3px;
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.15s;
}
.img-cell.selected .img-check { opacity: 1; }
.img-check svg { width: 14px; height: 14px; }

.img-captcha-footer {
    display: flex; align-items: center;
    padding: 8px 10px; gap: 6px;
    border-top: 1px solid #e0e0e0; min-height: 52px;
}
.footer-icons { display: flex; gap: 4px; }
.icon-btn {
    background: none; border: none; cursor: pointer; padding: 4px;
    color: #777; border-radius: 50%; display: flex;
    transition: background 0.15s;
}
.icon-btn:hover { background: #f0f0f0; }

.recaptcha-brand {
    display: flex; align-items: center; gap: 6px; flex: 1; justify-content: center;
}
.footer-right {
    display: flex; flex-direction: column; align-items: flex-end; gap: 4px;
}
.try-again { font-size: 11px; color: #d32f2f; font-weight: 500; }

.verify-btn {
    background: #4a90d9; color: white; border: none; border-radius: 4px;
    padding: 8px 18px; font-size: 13px; font-weight: bold; cursor: pointer;
    letter-spacing: 0.5px; transition: background 0.15s, transform 0.1s;
    min-width: 80px;
}
.verify-btn:hover:not(:disabled) { background: #3578c7; }
.verify-btn:active:not(:disabled){ transform: scale(0.97); }
.verify-btn.verifying { background: #aaa; cursor: default; }
.verify-btn.solved    { background: #34a853; }

.shake { animation: shake 0.45s cubic-bezier(.36,.07,.19,.97); }
@keyframes shake {
    10%, 90% { transform: translateX(-2px); }
    20%, 80% { transform: translateX(4px); }
    30%, 50%, 70% { transform: translateX(-6px); }
    40%, 60% { transform: translateX(6px); }
}

.solved-overlay {
    position: absolute; inset: 0;
    background: rgba(255,255,255,0.88);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 10px;
}
.solved-check { width: 64px; height: 64px; }
.solved-text  { font-size: 18px; font-weight: bold; color: #4285f4; }
.fade-enter-active { transition: opacity 0.3s; }
.fade-enter-from   { opacity: 0; }
</style>
