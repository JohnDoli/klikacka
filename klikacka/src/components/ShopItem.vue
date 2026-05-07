<script setup lang="ts">
import type { UpgradeView } from '../stores/game';

const props = defineProps<{
    upgrade: UpgradeView
}>();

const emit = defineEmits<{
    buy: [];
}>();

function buy() {
    if (props.upgrade.canBuy) {
        emit('buy');
    }
}
</script>

<template>
    <div 
        class="upgrade-item" 
        :class="{ 'disabled': !upgrade.canBuy, 'maxed': upgrade.maxed }"
        @click="buy"
    >
        <div class="upgrade-header">
            <span class="upgrade-name">{{ upgrade.name }}</span>
            <span class="upgrade-cost">{{ upgrade.cost }}</span>
        </div>
        <div class="upgrade-desc">{{ upgrade.description }}</div>
        <div class="upgrade-level">Owned: {{ upgrade.owned }}<span v-if="upgrade.maxPurchases"> / {{ upgrade.maxPurchases }}</span></div>
    </div>
</template>
