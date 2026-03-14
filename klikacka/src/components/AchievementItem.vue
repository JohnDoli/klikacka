<script setup lang="ts">
import type { Achievement } from '../stores/game';

defineProps<{
    achievement: Achievement
}>();
</script>

<template>
    <div 
        class="achievement-item" 
        :class="{ 'unlocked': achievement.unlocked, 'solved': achievement.solved }"
    >
        <div class="achievement-icon">{{ achievement.icon }}</div>
        <div class="achievement-info">
            <div class="achievement-title">{{ achievement.title }}</div>
            <div class="achievement-desc">{{ achievement.description }}</div>
        </div>
    </div>
</template>
