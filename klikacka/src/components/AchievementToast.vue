<script setup lang="ts">

import type { Achievement } from '../stores/game';

const props = defineProps<{
    achievement: Achievement | null;
}>();

const emit = defineEmits<{ dismiss: [] }>();
</script>

<template>
    <Transition name="toast">
        <div v-if="achievement" class="achievement-toast" @click="emit('dismiss')">
            <div class="toast-inner">
                <div class="toast-icon">{{ achievement.icon }}</div>
                <div class="toast-text">
                    <div class="toast-title">Achievement Unlocked!</div>
                    <div class="toast-name">{{ achievement.title }}</div>
                    <div class="toast-desc">{{ achievement.description }}</div>
                </div>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.achievement-toast {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #ffd700, #ffaa00);
    border: 2px solid #e69900;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    padding: 10px 16px;
    cursor: pointer;
    z-index: 9999;
    min-width: 240px;
    max-width: 320px;
}
.toast-inner {
    display: flex;
    align-items: center;
    gap: 12px;
}
.toast-icon {
    font-size: 28px;
    flex-shrink: 0;
}
.toast-title {
    font-size: 10px;
    font-weight: bold;
    text-transform: uppercase;
    color: #7a5000;
    letter-spacing: 0.5px;
}
.toast-name {
    font-size: 14px;
    font-weight: bold;
    color: #3a2000;
}
.toast-desc {
    font-size: 11px;
    color: #5a3a00;
}
.toast-enter-active, .toast-leave-active {
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-enter-from {
    opacity: 0;
    transform: translateX(-50%) translateY(40px) scale(0.8);
}
.toast-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(20px) scale(0.9);
}
</style>
