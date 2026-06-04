<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAudioStore } from '../stores/audio';

const props = defineProps<{
    isGolden?: boolean;
    verificationTime?: number;
}>();

const emit = defineEmits(['solved']);
const audio = useAudioStore();

const verifying = ref(false);
const solved = ref(false);
const justSolved = ref(false);

const boxClass = computed(() => ({
    'golden': props.isGolden,
    'verifying': verifying.value,
    'solved': solved.value,
    'just-solved': justSolved.value,
    'animations-off': !audio.animationsEnabled,
}));

function startVerification() {
    if (verifying.value || solved.value) return;
    verifying.value = true;
    setTimeout(() => {
        verifying.value = false;
        solved.value = true;
        justSolved.value = true;
        emit('solved');
        audio.playSfx('correct');
        setTimeout(() => {
            solved.value = false;
            justSolved.value = false;
        }, 500);
    }, props.verificationTime || 2000);
}
</script>

<template>
    <div class="captcha-box" :class="boxClass">
        <div class="captcha-left">
            <div class="captcha-checkbox" @click="startVerification">
                <div class="spinner"></div>
                <div class="checkmark"></div>
            </div>
            <div class="captcha-label">I'm not a robot</div>
        </div>
        <div class="captcha-right">
            <div class="captcha-logo">
                <svg viewBox="0 0 48 48">
                    <path fill="#4285f4" d="M24,0C10.7,0,0,10.7,0,24s10.7,24,24,24s24-10.7,24-24S37.3,0,24,0z M24,44C13,44,4,35,4,24S13,4,24,4s20,9,20,20S35,44,24,44z"/>
                    <path fill="#4285f4" d="M35,24c0,6.1-4.9,11-11,11s-11-4.9-11-11s4.9-11,11-11S35,17.9,35,24z" opacity="0.1"/>
                </svg>
            </div>
            <div class="captcha-terms">reCAPTCHA<br>Privacy - Terms</div>
        </div>
        <div v-if="isGolden" class="golden-badge">✨ GOLDEN</div>
    </div>
</template>

<style scoped>
.just-solved:not(.animations-off) {
    animation: solveFlash 0.4s ease;
}
@keyframes solveFlash {
    0% { transform: scale(1); }
    30% { transform: scale(1.05); box-shadow: 0 0 16px rgba(0,200,80,0.7); }
    100% { transform: scale(1); }
}
.golden-badge {
    position: absolute;
    top: -10px;
    right: 8px;
    background: linear-gradient(135deg, #ffd700, #ffaa00);
    color: #5a3a00;
    font-size: 10px;
    font-weight: bold;
    padding: 2px 6px;
    border-radius: 4px;
    box-shadow: 0 2px 6px rgba(255,200,0,0.5);
}
.captcha-box {
    position: relative;
}
</style>