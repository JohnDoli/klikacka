<script setup lang="ts">
import type { Upgrade } from '../stores/game';

const props = defineProps<{
    upgrade: Upgrade
}>();

const emit = defineEmits(['buy']);

function buy() {
    if (!props.upgrade.disabled) {
        emit('buy', props.upgrade);
    }
}
</script>

<template>
    <div 
        class="upgrade-item" 
        :class="{ 'disabled': upgrade.disabled }"
        @click="buy"
    >
        <div class="upgrade-header">
            <span class="upgrade-name">{{ upgrade.name }}</span>
            <span class="upgrade-cost">{{ upgrade.cost }}</span>
        </div>
        <div class="upgrade-desc">{{ upgrade.description }}</div>
        <div class="upgrade-level">Level: {{ upgrade.level }}</div>
    </div>
</template>
