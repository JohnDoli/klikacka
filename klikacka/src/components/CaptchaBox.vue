<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
    isGolden?: boolean;
    verificationTime?: number; // in ms
}>();

const emit = defineEmits(['solved']);

const verifying = ref(false);
const solved = ref(false);

function startVerification() {
    if (verifying.value || solved.value) return;

    verifying.value = true;
    setTimeout(() => {
        verifying.value = false;
        solved.value = true;
        emit('solved');
        
        // Reset after a short delay so user can click again? 
        // Or destroy component? In the original game, usually it refreshes or stays solved for a bit.
        // Let's assume it resets after 1 second for now so it's playable.
        setTimeout(() => {
            solved.value = false;
        }, 500); // Quick reset for gameplay flow
    }, props.verificationTime || 2000);
}
</script>

<template>
    <div class="captcha-box" :class="{ 'golden': isGolden, 'verifying': verifying, 'solved': solved }">
        <div class="captcha-left">
            <div class="captcha-checkbox" @click="startVerification">
                <div class="spinner"></div> <!-- Show .spinner class on verifying -->
                <div class="checkmark"></div> <!-- Show .checkmark class on solved -->
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
    </div>
</template>

<style scoped>
/* Scoped styles if needed, but we rely on global styles for now as they are shared */
</style>
