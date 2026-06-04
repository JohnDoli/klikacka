<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useGameStore } from '../stores/game';
import { useAudioStore } from '../stores/audio';
import AchievementItem from '../components/AchievementItem.vue';
import ShopItem from '../components/ShopItem.vue';
import CaptchaBox from '../components/CaptchaBox.vue';
import AchievementToast from '../components/AchievementToast.vue';
import SettingsModal from '../components/SettingsModal.vue';
import PrestigeModal from '../components/PrestigeModal.vue';

const store = useGameStore();
const audio = useAudioStore();

const isLeftPanelOpen = ref(false);
const isRightPanelOpen = ref(false);
const showSettings = ref(false);
const showPrestige = ref(false);

const captchaSlots = computed(() => Array.from({ length: store.maxCaptchas }, (_, i) => i));
const verificationTime = computed(() => Math.max(450, 2000 / (store.verificationSpeed || 1)));
const showOfflineEarnings = computed(() => store.lastOfflineEarnings > 0);
const formattedOfflineEarnings = computed(() => store.lastOfflineEarnings.toFixed(2));
const showAfkDuration = computed(() => store.lastAfkDurationSeconds > 0);

// Achievement toast queue
const currentToast = computed(() => {
    const id = store.newlyUnlockedAchievements[0];
    return id ? store.achievements.find(a => a.id === id) ?? null : null;
});

let toastTimer: number | undefined;
watch(currentToast, (val) => {
    if (val) {
        audio.playSfx('yeey');
        clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => {
            store.dismissAchievement(val.id);
        }, 4000);
    }
});

// Golden captcha: randomly appear as golden
const goldenSlotIndex = ref(-1);
let goldenTimer: number | undefined;
function scheduleGolden() {
    clearTimeout(goldenTimer);
    const delay = 15000 + Math.random() * 30000;
    goldenTimer = window.setTimeout(() => {
        if (store.maxCaptchas > 0) {
            goldenSlotIndex.value = Math.floor(Math.random() * store.maxCaptchas);
            window.setTimeout(() => { goldenSlotIndex.value = -1; }, 8000);
        }
        scheduleGolden();
    }, delay);
}

function formatDuration(totalSeconds: number) {
    const s = Math.max(0, Math.floor(totalSeconds));
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), rs = s % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${rs}s`;
    return `${rs}s`;
}
const formattedAfkDuration = computed(() => formatDuration(store.lastAfkDurationSeconds));

let incomeIntervalId: number | undefined;

function toggleLeftPanel() {
    if (!isLeftPanelOpen.value && isRightPanelOpen.value) isRightPanelOpen.value = false;
    isLeftPanelOpen.value = !isLeftPanelOpen.value;
}
function toggleRightPanel() {
    if (!isRightPanelOpen.value && isLeftPanelOpen.value) isLeftPanelOpen.value = false;
    isRightPanelOpen.value = !isRightPanelOpen.value;
}

function onCaptchaSolved(slotIndex: number) {
    const isGolden = slotIndex === goldenSlotIndex.value;
    if (isGolden) goldenSlotIndex.value = -1;
    store.recordCaptchaSolved(isGolden);
}

function onBuyUpgrade(upgradeId: string) {
    store.buyUpgrade(upgradeId);
}

function dismissOfflineEarnings() {
    store.clearOfflineEarnings();
}

const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') store.startAfk();
    else store.endAfk();
};

// Start music on first user interaction
function onFirstInteraction() {
    audio.startMusic();
    window.removeEventListener('click', onFirstInteraction);
    window.removeEventListener('keydown', onFirstInteraction);
}

onMounted(() => {
    incomeIntervalId = window.setInterval(() => store.tickIncome(1), 1000);
    window.addEventListener('beforeunload', store.markActive);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('click', onFirstInteraction);
    window.addEventListener('keydown', onFirstInteraction);
    scheduleGolden();
});

onBeforeUnmount(() => {
    clearInterval(incomeIntervalId);
    clearTimeout(goldenTimer);
    clearTimeout(toastTimer);
    window.removeEventListener('beforeunload', store.markActive);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('click', onFirstInteraction);
    window.removeEventListener('keydown', onFirstInteraction);
});

const prestige = computed(() => store.prestigeCount);
const fmt = (n: number) => n >= 1_000_000 ? `${(n/1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n/1_000).toFixed(1)}K` : Math.floor(n).toString();
</script>

<template>
    <div class="xp-content">
        <Teleport to=".xp-nav">
            <div class="xp-nav-actions">
                <button class="mobile-btn" @click="toggleLeftPanel" v-if="!isLeftPanelOpen">🏆 Achievements</button>
                <button class="mobile-btn shop-toggle" @click="toggleRightPanel" v-if="!isRightPanelOpen">🛒 Shop</button>
                <button class="mobile-btn prestige-nav-btn" @click="showPrestige = true">
                    🔄 Prestige <span v-if="prestige > 0">({{ prestige }})</span>
                </button>
                <button class="mobile-btn settings-nav-btn" @click="showSettings = true">⚙️</button>
            </div>
        </Teleport>

        <div class="container" :class="{ 'panel-open': isLeftPanelOpen || isRightPanelOpen }">
            <!-- Achievements Panel -->
            <aside class="achievements-sidebar left-panel" :class="{ 'show-mobile': isLeftPanelOpen }">
                <div class="mobile-control-bar" style="text-align:right;margin-bottom:5px;">
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

            <!-- Main Area -->
            <main>
                <div class="score-container">
                    <div>
                        <span style="color:#444;font-size:28px;">$</span>
                        <span>{{ fmt(store.money) }}</span>
                    </div>
                    <span class="mps-label">
                        (<span>{{ store.passiveIncome.toFixed(1) }}</span> $/sec,
                        <span>+{{ store.revenuePerClick.toFixed(1) }}</span> $/captcha)
                    </span>
                    <div v-if="prestige > 0" class="prestige-badge">
                        🔄 Prestige {{ prestige }} · ×{{ store.prestigeMultiplier.toFixed(2) }}
                    </div>
                </div>

                <div v-if="showOfflineEarnings" class="offline-earnings">
                    <div class="offline-earnings-text">
                        While you were away, you earned <strong>${{ formattedOfflineEarnings }}</strong>.
                        <span v-if="showAfkDuration"> AFK: <strong>{{ formattedAfkDuration }}</strong>.</span>
                    </div>
                    <button class="mobile-btn" @click="dismissOfflineEarnings">OK</button>
                </div>

                <div class="captchas-wrapper">
                    <CaptchaBox
                        v-for="(_, idx) in captchaSlots"
                        :key="idx"
                        :verificationTime="verificationTime"
                        :isGolden="idx === goldenSlotIndex"
                        @solved="onCaptchaSolved(idx)"
                    />
                </div>
            </main>

            <!-- Shop Panel -->
            <aside class="right-panel" :class="{ 'show-mobile': isRightPanelOpen }">
                <div class="mobile-control-bar" style="text-align:right;margin-bottom:5px;">
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

        <!-- Modals -->
        <SettingsModal v-if="showSettings" @close="showSettings = false" />
        <PrestigeModal v-if="showPrestige" @close="showPrestige = false" @prestiged="() => {}" />

        <!-- Achievement Toast -->
        <AchievementToast
            :achievement="currentToast"
            @dismiss="currentToast && store.dismissAchievement(currentToast.id)"
        />
    </div>
</template>

<style scoped>
.prestige-badge {
    font-size: 11px;
    color: #cc6600;
    font-weight: bold;
    margin-top: 2px;
}
.prestige-nav-btn {
    color: #cc6600 !important;
    font-weight: bold;
}
.settings-nav-btn {
    margin-left: auto;
}
</style>
