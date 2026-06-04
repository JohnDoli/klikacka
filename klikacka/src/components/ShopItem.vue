<script setup lang="ts">
import type { UpgradeView } from '../stores/game';
import { useAudioStore } from '../stores/audio';

const props = defineProps<{ upgrade: UpgradeView }>();
const emit = defineEmits<{ buy: [] }>();
const audio = useAudioStore();

function buy() {
    if (props.upgrade.canBuy) {
        emit('buy');
        audio.playSfx('buy');
    }
}
</script>

<template>
    <div
        class="upgrade-item"
        :class="{ 'disabled': !upgrade.canBuy, 'maxed': upgrade.maxed, 'can-buy': upgrade.canBuy }"
        @click="buy"
    >
        <div class="upgrade-header">
            <span class="upgrade-name">{{ upgrade.name }}</span>
            <span class="upgrade-cost" v-if="!upgrade.maxed">${{ upgrade.cost }}</span>
            <span class="upgrade-cost maxed-label" v-else>MAX</span>
        </div>
        <div class="upgrade-desc">{{ upgrade.description }}</div>
        <div class="upgrade-level">Owned: {{ upgrade.owned }}<span v-if="upgrade.maxPurchases"> / {{ upgrade.maxPurchases }}</span></div>
    </div>
</template>

<style scoped>
.can-buy {
    animation: pulse-buyable 2s ease-in-out infinite;
}
@keyframes pulse-buyable {
    0%, 100% { box-shadow: 0 1px 3px rgba(0,100,0,0.15); }
    50% { box-shadow: 0 2px 8px rgba(0,150,0,0.35); }
}
.maxed-label {
    color: #888;
    font-style: italic;
}
</style>