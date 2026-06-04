<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAudioStore } from '../stores/audio';

const emit = defineEmits<{ solved: []; dismissed: [] }>();
const audio = useAudioStore();

// Each puzzle: a category label + 9 image slots (some correct, some decoys)
// We use real Unsplash photos by keyword for variety
interface Puzzle {
    label: string;
    images: { url: string; correct: boolean }[];
}

const puzzles: Puzzle[] = [
    {
        label: 'crosswalks',
        images: [
            { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=150&fit=crop', correct: true },
            { url: 'https://images.unsplash.com/photo-1565793979099-8aae5534bddb?w=200&h=150&fit=crop', correct: false },
            { url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=200&h=150&fit=crop', correct: false },
            { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=150&fit=crop', correct: true },
            { url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=200&h=150&fit=crop', correct: true },
            { url: 'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=200&h=150&fit=crop', correct: false },
            { url: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=200&h=150&fit=crop', correct: false },
            { url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=200&h=150&fit=crop', correct: true },
            { url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=200&h=150&fit=crop', correct: false },
        ],
    },
    {
        label: 'traffic lights',
        images: [
            { url: 'https://images.unsplash.com/photo-1597423244036-ef5020e83f3c?w=200&h=150&fit=crop', correct: true },
            { url: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=200&h=150&fit=crop', correct: false },
            { url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=200&h=150&fit=crop', correct: false },
            { url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&h=150&fit=crop', correct: false },
            { url: 'https://images.unsplash.com/photo-1500916434205-0c77489c6cf7?w=200&h=150&fit=crop', correct: true },
            { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=150&fit=crop', correct: false },
            { url: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=200&h=150&fit=crop', correct: true },
            { url: 'https://images.unsplash.com/photo-1465447142348-e9952c393450?w=200&h=150&fit=crop', correct: false },
            { url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=200&h=150&fit=crop', correct: true },
        ],
    },
    {
        label: 'buses',
        images: [
            { url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=200&h=150&fit=crop', correct: true },
            { url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=200&h=150&fit=crop', correct: false },
            { url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&h=150&fit=crop', correct: false },
            { url: 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=200&h=150&fit=crop', correct: true },
            { url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=200&h=150&fit=crop', correct: false },
            { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=150&fit=crop', correct: false },
            { url: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=200&h=150&fit=crop', correct: true },
            { url: 'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=200&h=150&fit=crop', correct: false },
            { url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=200&h=150&fit=crop', correct: true },
        ],
    },
    {
        label: 'fire hydrants',
        images: [
            { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=150&fit=crop', correct: false },
            { url: 'https://images.unsplash.com/photo-1565793979099-8aae5534bddb?w=200&h=150&fit=crop', correct: true },
            { url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=200&h=150&fit=crop', correct: false },
            { url: 'https://images.unsplash.com/photo-1465447142348-e9952c393450?w=200&h=150&fit=crop', correct: false },
            { url: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=200&h=150&fit=crop', correct: true },
            { url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&h=150&fit=crop', correct: false },
            { url: 'https://images.unsplash.com/photo-1500916434205-0c77489c6cf7?w=200&h=150&fit=crop', correct: false },
            { url: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=200&h=150&fit=crop', correct: true },
            { url: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=200&h=150&fit=crop', correct: false },
        ],
    },
];

// Pick a random puzzle on mount
const puzzle = ref<Puzzle>(puzzles[Math.floor(Math.random() * puzzles.length)]);
const selected = ref<Set<number>>(new Set());
const shake = ref(false);
const verifying = ref(false);
const solved = ref(false);
const tryAgain = ref(false);
const attempts = ref(0);

function toggleImage(idx: number) {
    if (verifying.value || solved.value) return;
    const s = new Set(selected.value);
    if (s.has(idx)) s.delete(idx);
    else s.add(idx);
    selected.value = s;
    tryAgain.value = false;
}

const correctIndices = computed(() =>
    puzzle.value.images.map((img, i) => img.correct ? i : -1).filter(i => i !== -1)
);

function verify() {
    if (verifying.value || solved.value) return;
    verifying.value = true;

    const sel = [...selected.value].sort().join(',');
    const correct = [...correctIndices.value].sort().join(',');

    setTimeout(() => {
        verifying.value = false;
        if (sel === correct) {
            solved.value = true;
            audio.playSfx('correct');
            setTimeout(() => emit('solved'), 800);
        } else {
            attempts.value++;
            tryAgain.value = true;
            shake.value = true;
            setTimeout(() => shake.value = false, 500);
            // Reset and show new puzzle after failed attempt
            setTimeout(() => {
                puzzle.value = puzzles[Math.floor(Math.random() * puzzles.length)];
                selected.value = new Set();
                tryAgain.value = false;
            }, 1200);
        }
    }, 600);
}

function refresh() {
    puzzle.value = puzzles[Math.floor(Math.random() * puzzles.length)];
    selected.value = new Set();
    tryAgain.value = false;
}
</script>

<template>
    <div class="captcha-modal-overlay">
        <div class="img-captcha" :class="{ shake, solved }">
            <!-- Header -->
            <div class="img-captcha-header">
                <div class="img-captcha-header-text">
                    <div class="select-all">Select all images with</div>
                    <div class="category">{{ puzzle.label }}</div>
                    <div class="click-verify">Click verify once there are none left.</div>
                </div>
            </div>

            <!-- Grid -->
            <div class="img-captcha-grid">
                <div
                    v-for="(img, idx) in puzzle.images"
                    :key="idx"
                    class="img-cell"
                    :class="{ selected: selected.has(idx), 'reveal-correct': solved && img.correct }"
                    @click="toggleImage(idx)"
                >
                    <img :src="img.url" :alt="`image ${idx+1}`" loading="lazy" />
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
                    <button class="icon-btn" @click="refresh" title="Get new challenge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                        </svg>
                    </button>
                    <button class="icon-btn" title="Audio challenge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                            <path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
                        </svg>
                    </button>
                    <button class="icon-btn" title="Help">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                        </svg>
                    </button>
                </div>

                <div class="recaptcha-brand">
                    <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" width="32" height="32" alt="reCAPTCHA" style="border-radius:4px;" />
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
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    display: flex;
    align-items: center;
    justify-content: center;
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
}

.img-captcha-header {
    background: #4a90d9;
    padding: 14px 16px 12px;
    color: white;
}
.select-all { font-size: 13px; font-weight: 400; }
.category { font-size: 22px; font-weight: 700; line-height: 1.2; }
.click-verify { font-size: 12px; opacity: 0.9; margin-top: 2px; }

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
    background: #eee;
}
.img-cell img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: filter 0.15s;
    pointer-events: none;
    user-select: none;
}
.img-cell.selected img { filter: brightness(0.75); }
.img-cell.selected { outline: 3px solid #4a90d9; outline-offset: -3px; }

.img-check {
    position: absolute;
    top: 6px; left: 6px;
    width: 22px; height: 22px;
    background: #4a90d9;
    border-radius: 3px;
    display: flex; align-items: center; justify-content: center;
    opacity: 0;
    transition: opacity 0.15s;
}
.img-cell.selected .img-check { opacity: 1; }
.img-check svg { width: 14px; height: 14px; }

.img-cell.reveal-correct { outline: 3px solid #34a853; outline-offset: -3px; }

.img-captcha-footer {
    display: flex;
    align-items: center;
    padding: 8px 10px;
    border-top: 1px solid #e0e0e0;
    gap: 6px;
    min-height: 52px;
}
.footer-icons { display: flex; gap: 4px; }
.icon-btn {
    background: none; border: none; cursor: pointer; padding: 4px;
    color: #777; border-radius: 50%; display: flex;
    transition: background 0.15s;
}
.icon-btn:hover { background: #f0f0f0; }

.recaptcha-brand {
    display: flex; align-items: center; gap: 6px; flex: 1;
    justify-content: center;
}

.footer-right {
    display: flex; flex-direction: column; align-items: flex-end; gap: 4px;
}
.try-again { font-size: 11px; color: #d32f2f; font-weight: 500; }

.verify-btn {
    background: #4a90d9;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 18px;
    font-size: 13px;
    font-weight: bold;
    cursor: pointer;
    letter-spacing: 0.5px;
    transition: background 0.15s, transform 0.1s;
    min-width: 80px;
}
.verify-btn:hover:not(:disabled) { background: #3578c7; }
.verify-btn:active:not(:disabled) { transform: scale(0.97); }
.verify-btn.verifying { background: #aaa; cursor: default; }
.verify-btn.solved { background: #34a853; }

/* shake animation */
.shake { animation: shake 0.45s cubic-bezier(.36,.07,.19,.97); }
@keyframes shake {
    10%, 90% { transform: translateX(-2px); }
    20%, 80% { transform: translateX(4px); }
    30%, 50%, 70% { transform: translateX(-6px); }
    40%, 60% { transform: translateX(6px); }
}

/* solved overlay */
.solved-overlay {
    position: absolute; inset: 0;
    background: rgba(255,255,255,0.88);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 10px;
}
.solved-check { width: 64px; height: 64px; }
.solved-text { font-size: 18px; font-weight: bold; color: #4285f4; }
.fade-enter-active { transition: opacity 0.3s; }
.fade-enter-from { opacity: 0; }
</style>
