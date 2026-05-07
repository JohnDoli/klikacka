<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useGameStore } from '../stores/game';
import AchievementItem from '../components/AchievementItem.vue';
import ShopItem from '../components/ShopItem.vue';
import CaptchaBox from '../components/CaptchaBox.vue';

const store = useGameStore();

const isLeftPanelOpen = ref(false);
const isRightPanelOpen = ref(false);
const captchaSlots = computed(() => Array.from({ length: store.maxCaptchas + 1 }, (_, index) => index + 1));
const verificationTime = computed(() => Math.max(450, 2000 / (store.verificationSpeed || 1)));
const showOfflineEarnings = computed(() => store.lastOfflineEarnings > 0);
const formattedOfflineEarnings = computed(() => store.lastOfflineEarnings.toFixed(2));
const showAfkDuration = computed(() => store.lastAfkDurationSeconds > 0);

function formatDuration(totalSeconds: number) {
    const seconds = Math.max(0, Math.floor(totalSeconds));
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
        return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
}

const formattedAfkDuration = computed(() => formatDuration(store.lastAfkDurationSeconds));

let incomeIntervalId: number | undefined;

function toggleLeftPanel() {
    if (!isLeftPanelOpen.value) {
        if (isRightPanelOpen.value) isRightPanelOpen.value = false;
    }
    isLeftPanelOpen.value = !isLeftPanelOpen.value;
}

function toggleRightPanel() {
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

function dismissOfflineEarnings() {
    store.clearOfflineEarnings();
}

const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
        store.startAfk();
    } else if (document.visibilityState === 'visible') {
        store.endAfk();
    }
};

onMounted(() => {
    incomeIntervalId = window.setInterval(() => {
        store.tickIncome(1);
    }, 1000);

    window.addEventListener('beforeunload', store.markActive);
    document.addEventListener('visibilitychange', handleVisibilityChange);
});

onBeforeUnmount(() => {
    if (incomeIntervalId !== undefined) {
        window.clearInterval(incomeIntervalId);
    }
    window.removeEventListener('beforeunload', store.markActive);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
});
</script>

<template>
    <div class="xp-content">
        <Teleport to=".xp-nav">
            <div class="xp-nav-actions">
                <button class="mobile-btn" @click="toggleLeftPanel">🏆 Achievements</button>
                <button class="mobile-btn shop-toggle" @click="toggleRightPanel" v-if="!isRightPanelOpen">🛒 Shop</button>
            </div>
        </Teleport>
        <div class="container" :class="{ 'panel-open': isLeftPanelOpen || isRightPanelOpen }">
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
                <div class="score-container">
                    <div>
                        <span style="color: #444; font-size: 28px;">$</span><span>{{ Math.floor(store.money) }}</span>
                    </div>
                    <span class="mps-label">(<span>{{ store.passiveIncome }}</span> $/sec, <span>+{{ store.revenuePerClick }}</span> $/captcha)</span>
                </div>

                <div v-if="showOfflineEarnings" class="offline-earnings">
                    <div class="offline-earnings-text">
                        While you were away, you earned <strong>${{ formattedOfflineEarnings }}</strong>.
                        <span v-if="showAfkDuration"> AFK time: <strong>{{ formattedAfkDuration }}</strong>.</span>
                    </div>
                    <button class="mobile-btn" @click="dismissOfflineEarnings">OK</button>
                </div>

                <div class="captchas-wrapper">
                    <template v-for="slot in captchaSlots" :key="slot">
                        <CaptchaBox 
                            v-if="slot <= store.maxCaptchas"
                            :verificationTime="verificationTime" 
                            @solved="onCaptchaSolved" 
                        />
                        <div v-else class="captcha-placeholder">Slot #{{ slot }} (Locked)</div>
                    </template>
                </div>
            </main>

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
    </div>
</template>
