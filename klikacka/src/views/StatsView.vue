<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '../stores/game';

const store = useGameStore();
const totalIncome = computed(() => store.lifetimeMoneyEarned.toFixed(2));
const totalSpent = computed(() => store.totalMoneySpent.toFixed(2));
const passivePerSecond = computed(() => store.passiveIncome.toFixed(2));
const achievementsUnlocked = computed(() => store.achievements.filter(a => a.unlocked).length);
const achievementsTotal = computed(() => store.achievements.length);
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
                    <div class="stats-value">{{ store.captchaSolvedCount.toLocaleString() }}</div>
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
                    <div class="stats-value">×{{ store.incomeMultiplier.toFixed(2) }}</div>
                </div>
                <div class="stats-item">
                    <div class="stats-label">Prestige count</div>
                    <div class="stats-value">{{ store.prestigeCount }}</div>
                </div>
                <div class="stats-item">
                    <div class="stats-label">Prestige bonus</div>
                    <div class="stats-value">×{{ store.prestigeMultiplier.toFixed(2) }}</div>
                </div>
                <div class="stats-item">
                    <div class="stats-label">Golden captchas</div>
                    <div class="stats-value">{{ store.goldenCaptchasCaught }}</div>
                </div>
                <div class="stats-item">
                    <div class="stats-label">Achievements</div>
                    <div class="stats-value">{{ achievementsUnlocked }} / {{ achievementsTotal }}</div>
                </div>
            </div>
        </div>
    </div>
</template>
