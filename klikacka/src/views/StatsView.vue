<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '../stores/game';

const store = useGameStore();
const totalIncome = computed(() => store.lifetimeMoneyEarned.toFixed(2));
const totalSpent = computed(() => store.totalMoneySpent.toFixed(2));
const passivePerSecond = computed(() => store.passiveIncome.toFixed(2));
</script>

<template>
    <div class="xp-content">
        <div class="stats-panel">
            <h2>Stats</h2>
            <div class="stats-grid">
                <div class="stats-item">
                    <div class="stats-label">Current money</div>
                    <div class="stats-value">${{ Math.floor(store.money) }}</div>
                </div>
                <div class="stats-item">
                    <div class="stats-label">Passive income</div>
                    <div class="stats-value">${{ passivePerSecond }} / sec</div>
                </div>
                <div class="stats-item">
                    <div class="stats-label">Captcha solved</div>
                    <div class="stats-value">{{ store.captchaSolvedCount }}</div>
                </div>
                <div class="stats-item">
                    <div class="stats-label">Lifetime earned</div>
                    <div class="stats-value">${{ totalIncome }}</div>
                </div>
                <div class="stats-item">
                    <div class="stats-label">Total spent</div>
                    <div class="stats-value">${{ totalSpent }}</div>
                </div>
                <div class="stats-item">
                    <div class="stats-label">Income multiplier</div>
                    <div class="stats-value">x{{ store.incomeMultiplier.toFixed(2) }}</div>
                </div>
            </div>
        </div>
    </div>
</template>
