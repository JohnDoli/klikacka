<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useGameStore } from './stores/game';
import AchievementItem from './components/AchievementItem.vue';
import ShopItem from './components/ShopItem.vue';
import CaptchaBox from './components/CaptchaBox.vue';

const store = useGameStore();

const isLeftPanelOpen = ref(false);
const isRightPanelOpen = ref(false);
const captchaSlots = computed(() => Array.from({ length: store.maxCaptchas + 1 }, (_, index) => index + 1));

let incomeIntervalId: number | undefined;

function toggleLeftPanel() {
    // If opening left, close right
    if (!isLeftPanelOpen.value) {
        if (isRightPanelOpen.value) isRightPanelOpen.value = false;
    }
    isLeftPanelOpen.value = !isLeftPanelOpen.value;
}

function toggleRightPanel() {
    // If opening right, close left
    if (!isRightPanelOpen.value) {
        if (isLeftPanelOpen.value) isLeftPanelOpen.value = false;
    }
    isRightPanelOpen.value = !isRightPanelOpen.value;
}

function onCaptchaSolved() {
    store.recordCaptchaSolved();
}

function onBuyUpgrade(upgradeId: string) {
    store.buyUpgrade(upgradeId);
}

onMounted(() => {
    incomeIntervalId = window.setInterval(() => {
        store.tickIncome(1);
    }, 1000);
});

onBeforeUnmount(() => {
    if (incomeIntervalId !== undefined) {
        window.clearInterval(incomeIntervalId);
    }
});
</script>

<template>
    <div class="xp-window">
        <div class="xp-title-bar">
            <div class="xp-title-text">CAPTCHA Clicker.exe</div>
            <div class="xp-button-group">
                <div class="xp-control-btn minimize">_</div>
                <div class="xp-control-btn maximize">□</div>
                <div class="xp-control-btn close">X</div>
            </div>
        </div>
        
        <div class="xp-content">
            <div class="container" :class="{ 'panel-open': isLeftPanelOpen || isRightPanelOpen }">
                <!-- Achievements Panel -->
                <aside class="achievements-sidebar left-panel" :class="{ 'show-mobile': isLeftPanelOpen }">
                    <div class="mobile-control-bar" style="text-align: right; margin-bottom: 5px;">
                        <button class="mobile-btn" @click="toggleLeftPanel">Close [X]</button>
                    </div>
                    <div class="panel-content">
                        <h2>Achievements</h2>
                        <div class="scrollable-list">
                            <div class="achievement-category" v-for="(list, category) in store.categorizedAchievements" :key="category">
                                <h3>{{ category }}</h3>
                                <div v-for="achievement in list" :key="achievement.id">
                                    <AchievementItem :achievement="achievement" />
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                <main>
                    <!-- Money Count -->
                    <div class="score-container">
                        <div>
                            <span style="color: #444; font-size: 28px;">$</span><span>{{ Math.floor(store.money) }}</span>
                        </div>
                        <span class="mps-label">(<span>{{ store.passiveIncome }}</span> $/sec, <span>+{{ store.revenuePerClick }}</span> $/captcha)</span>
                    </div>

                    <!-- Wrapper for Captchas -->
                    <div class="captchas-wrapper">
                        <template v-for="slot in captchaSlots" :key="slot">
                            <CaptchaBox 
                                v-if="slot <= store.maxCaptchas"
                                :verificationTime="2000 / (store.verificationSpeed || 1)" 
                                @solved="onCaptchaSolved" 
                            />
                            <div v-else class="captcha-placeholder">Slot #{{ slot }} (Locked)</div>
                        </template>
                    </div>
                </main>

                <!-- Shop Panel -->
                <aside class="right-panel" :class="{ 'show-mobile': isRightPanelOpen }">
                    <div class="mobile-control-bar" style="text-align: right; margin-bottom: 5px;">
                        <button class="mobile-btn" @click="toggleRightPanel">Close [X]</button>
                    </div>
                    <div class="panel-content">
                        <h2>Upgrade Shop</h2>
                        <div class="scrollable-list" id="shop-container">
                            <div class="upgrade-category" v-for="(list, category) in store.categorizedUpgrades" :key="category">
                                <h3>{{ category }} Upgrades</h3>
                                <div v-for="upgrade in list" :key="upgrade.id">
                                    <ShopItem :upgrade="upgrade" @buy="onBuyUpgrade(upgrade.id)" />
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            <div class="mobile-controls">
                <button class="mobile-btn" @click="toggleLeftPanel">🏆 Achievements</button>
                <button class="mobile-btn shop-toggle" @click="toggleRightPanel" v-if="!isRightPanelOpen">🛒 Shop</button>
            </div>
        </div>
    </div>
</template>

<style>
/* Global styles are in style.css */
</style>
