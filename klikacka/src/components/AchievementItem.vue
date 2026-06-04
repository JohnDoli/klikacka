<script setup lang="ts">
import type { Achievement } from '../stores/game';

defineProps<{ achievement: Achievement }>();
</script>

<template>
    <div
        class="achievement-item"
        :class="{ 'unlocked': achievement.unlocked, 'solved': achievement.solved }"
    >
        <div class="achievement-icon">{{ achievement.unlocked ? achievement.icon : '🔒' }}</div>
        <div class="achievement-info">
            <div class="achievement-title">{{ achievement.unlocked ? achievement.title : '???' }}</div>
            <div class="achievement-desc">{{ achievement.unlocked ? achievement.description : 'Keep playing to unlock!' }}</div>
        </div>
    </div>
</template>