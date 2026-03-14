<script setup lang="ts">
import { ref } from 'vue';
import { useGameStore } from './stores/game';
import AchievementItem from './components/AchievementItem.vue';
import ShopItem from './components/ShopItem.vue';
import CaptchaBox from './components/CaptchaBox.vue';

const store = useGameStore();

const isLeftPanelOpen = ref(false);
const isRightPanelOpen = ref(false);

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
    store.incrementMoney(store.revenuePerClick || 1); 
    // Add floating text or animation here if needed
    // Check achievements
    checkAchievements();
}

function checkAchievements() {
    // Basic achievement logic (mock)
    if (store.money >= 100) {
        const ach = store.achievements.find(a => a.id === 'pocket_change');
        if (ach && !ach.unlocked) ach.unlocked = true;
    }
}

function onBuyUpgrade(upgrade: any) {
    // Check if we can afford it using the store's current money
    if (store.spendMoney(upgrade.cost)) {
        upgrade.level++;
        
        // Apply upgrade logic based on ID
        if (upgrade.id === 'revenue_per_click') {
            store.revenuePerClick++;
        } else if (upgrade.id === 'verification_speed') {
            store.verificationSpeed *= 1.2; // 20% faster
        } else if (upgrade.id === 'captcha_slots' || upgrade.id === 'additional_captcha') {
            store.maxCaptchas++;
        }

        // Increase cost for the next level
        upgrade.cost = Math.floor(upgrade.cost * 1.5);
    }
}
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

                <!-- Mobile Toggle Buttons -->
                <div class="mobile-controls">
                    <button class="mobile-btn" @click="toggleLeftPanel">🏆 Achievements</button>
                    <button class="mobile-btn" @click="toggleRightPanel">🛒 Shop</button>
                </div>

                <main>
                    <!-- Money Count -->
                    <div class="score-container">
                        <div>
                            <span style="color: #444; font-size: 28px;">$</span><span>{{ store.money }}</span>
                        </div>
                        <span class="mps-label">(<span>{{ store.mps }}</span> $/sec)</span>
                    </div>

                    <!-- Wrapper for Captchas -->
                    <div class="captchas-wrapper">
                        <!-- Example Captchas -->
                        <CaptchaBox 
                            :verificationTime="2000 / (store.verificationSpeed || 1)" 
                            @solved="onCaptchaSolved" 
                        />
                        
                        <!-- Placeholders should be dynamic based on upgrades -->
                        <div class="captcha-placeholder" v-if="store.maxCaptchas < 2">Slot #2 (Locked)</div>
                        <CaptchaBox 
                            v-else 
                            :verificationTime="2000 / (store.verificationSpeed || 1)" 
                            @solved="onCaptchaSolved" 
                        />

                        <div class="captcha-placeholder" v-if="store.maxCaptchas < 3">Slot #3 (Locked)</div>
                        <CaptchaBox 
                            v-else 
                            :verificationTime="2000 / (store.verificationSpeed || 1)" 
                            @solved="onCaptchaSolved" 
                        />
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
                                    <ShopItem :upgrade="upgrade" @buy="onBuyUpgrade(upgrade)" />
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    </div>
</template>

<style>
/* Global styles are in style.css */
</style>
