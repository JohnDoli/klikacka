import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
    solved: boolean;
    category: string;
}

export type UpgradeCategory = 'basic' | 'automatization' | 'special';
export type UpgradeEffect =
    | 'click_power'
    | 'passive_income'
    | 'afk_income'
    | 'verification_speed'
    | 'captcha_slots'
    | 'income_multiplier';

export interface UpgradeDefinition {
    id: string;
    name: string;
    description: string;
    baseCost: number;
    costGrowth: number;
    owned: number;
    category: UpgradeCategory;
    effect: UpgradeEffect;
    effectValue: number;
    maxPurchases?: number;
}

export interface UpgradeView extends UpgradeDefinition {
    cost: number;
    canBuy: boolean;
    maxed: boolean;
}

interface SaveState {
    money: number;
    mps: number;
    afkCurrency: number;
    revenuePerClick: number;
    verificationSpeed: number;
    maxCaptchas: number;
    incomeMultiplier: number;
    captchaSolvedCount: number;
    lifetimeMoneyEarned: number;
    totalMoneySpent: number;
    lastActiveAt: number;
    upgrades: Array<Pick<UpgradeDefinition, 'id' | 'owned'>>;
    achievements: Array<Pick<Achievement, 'id' | 'unlocked' | 'solved'>>;
}

export const useGameStore = defineStore('game', () => {
    const STORAGE_KEY = 'klikacka-game-state-v1';
    const OFFLINE_RATE = 0.7;
    const OFFLINE_CAP_SECONDS = 6 * 60 * 60;

    const money = ref(0);
    const mps = ref(0);
    const afkCurrency = ref(0);
    
    // Config
    const revenuePerClick = ref(1);
    const verificationSpeed = ref(1.0);
    const maxCaptchas = ref(1);
    const incomeMultiplier = ref(1);

    const captchaSolvedCount = ref(0);
    const lifetimeMoneyEarned = ref(0);
    const totalMoneySpent = ref(0);
    const lastActiveAt = ref(Date.now());
    const lastOfflineEarnings = ref(0);
    const afkStartAt = ref<number | null>(null);
    const lastAfkDurationSeconds = ref(0);

    const achievements = ref<Achievement[]>([
        // Clicking
        { id: 'newbie_clicker', title: 'Newbie Clicker', description: 'Solve 100 captchas.', icon: '🖱️', unlocked: false, solved: false, category: 'Clicking' },
        { id: 'exp_clicker', title: 'Experienced Clicker', description: 'Solve 1,000 captchas.', icon: '🖱️', unlocked: false, solved: false, category: 'Clicking' },
        { id: 'master_clicker', title: 'Click Master', description: 'Solve 10,000 captchas.', icon: '🖱️', unlocked: false, solved: false, category: 'Clicking' },
        { id: 'god_clicker', title: 'Click God', description: 'Solve 100,000 captchas.', icon: '🖱️', unlocked: false, solved: false, category: 'Clicking' },
        // Special
        { id: 'golden_touch', title: 'Golden Touch', description: 'Catch 1 Golden Captcha.', icon: '✨', unlocked: false, solved: false, category: 'Special' },
        { id: 'golden_hunter', title: 'Golden Hunter', description: 'Catch 10 Golden Captchas.', icon: '✨', unlocked: false, solved: false, category: 'Special' },
        { id: 'midas', title: 'Midas', description: 'Catch 100 Golden Captchas.', icon: '✨', unlocked: false, solved: false, category: 'Special' },
        // Shop
        { id: 'first_upgrade', title: 'First Upgrade', description: 'Buy your first upgrade.', icon: '🛒', unlocked: false, solved: false, category: 'Shop' },
        { id: 'big_spender', title: 'Big Spender', description: 'Spend $1,000.', icon: '💰', unlocked: false, solved: false, category: 'Shop' },
        { id: 'tech_enthusiast', title: 'Tech Enthusiast', description: 'Unlock Auto-Clicker.', icon: '🤖', unlocked: false, solved: false, category: 'Shop' },
        { id: 'full_house', title: 'Full House', description: 'Unlock all slots.', icon: '🎰', unlocked: false, solved: false, category: 'Shop' },
        // Money
        { id: 'pocket_change', title: 'Pocket Change', description: 'Earn $100.', icon: '💵', unlocked: false, solved: false, category: 'Money' },
        { id: 'richie_rich', title: 'Richie Rich', description: 'Earn $10,000.', icon: '💵', unlocked: false, solved: false, category: 'Money' },
        { id: 'millionaire', title: 'Millionaire', description: 'Earn $1,000,000.', icon: '💰', unlocked: false, solved: false, category: 'Money' },
         // Secret
        { id: 'hacker', title: 'Hacker?', description: '...', icon: '❓', unlocked: false, solved: false, category: 'Secret' },
        { id: 'patient', title: 'Patient', description: '...', icon: '❓', unlocked: false, solved: false, category: 'Secret' },
    ]);

    const upgrades = ref<UpgradeDefinition[]>([
        { id: 'revenue_per_click', name: 'Click Boost', description: 'Increase money earned from each solved captcha.', baseCost: 30, costGrowth: 1.5, owned: 0, category: 'basic', effect: 'click_power', effectValue: 0.75, maxPurchases: 25 },
        { id: 'verification_speed', name: 'Verification Speed', description: 'Reduces the time needed to verify a captcha.', baseCost: 20, costGrowth: 1.45, owned: 0, category: 'basic', effect: 'verification_speed', effectValue: 0.2, maxPurchases: 10 },
        { id: 'captcha_slots', name: 'Captcha Slots', description: 'Unlocks one more visible captcha slot.', baseCost: 120, costGrowth: 1.7, owned: 0, category: 'basic', effect: 'captcha_slots', effectValue: 1, maxPurchases: 4 },
        { id: 'passive_cps', name: 'CPS Generator', description: 'Adds passive money per second.', baseCost: 60, costGrowth: 1.6, owned: 0, category: 'automatization', effect: 'passive_income', effectValue: 0.7, maxPurchases: 25 },
        { id: 'afk_currency', name: 'AFK Currency', description: 'Adds idle income that keeps flowing while the game is open.', baseCost: 200, costGrowth: 1.6, owned: 0, category: 'automatization', effect: 'afk_income', effectValue: 1.2, maxPurchases: 15 },
        { id: 'script', name: 'Script', description: 'Automates part of the clicking loop.', baseCost: 350, costGrowth: 1.7, owned: 0, category: 'automatization', effect: 'passive_income', effectValue: 2, maxPurchases: 10 },
        { id: 'bot', name: 'Bot', description: 'A stronger automation layer with better throughput.', baseCost: 900, costGrowth: 1.8, owned: 0, category: 'automatization', effect: 'passive_income', effectValue: 4, maxPurchases: 8 },
        { id: 'server_farm', name: 'Server Farm', description: 'Generates substantial passive and AFK income.', baseCost: 2500, costGrowth: 1.95, owned: 0, category: 'special', effect: 'afk_income', effectValue: 8, maxPurchases: 6 },
        { id: 'golden_chance', name: 'Golden Chance', description: 'Increases all income and click rewards.', baseCost: 1200, costGrowth: 2.0, owned: 0, category: 'special', effect: 'income_multiplier', effectValue: 0.06, maxPurchases: 10 },
        { id: 'bonus_duration', name: 'Bonus Duration', description: 'Keeps efficiency boosts active longer.', baseCost: 1600, costGrowth: 1.9, owned: 0, category: 'special', effect: 'verification_speed', effectValue: 0.3, maxPurchases: 6 },
        { id: 'income_multiplier', name: 'Income Multiplier', description: 'Permanently multiplies all income.', baseCost: 6000, costGrowth: 2.2, owned: 0, category: 'special', effect: 'income_multiplier', effectValue: 0.1, maxPurchases: 8 },
    ]);

    function roundMoney(value: number) {
        return Math.round(value * 100) / 100;
    }

    function getUpgradeCost(upgrade: UpgradeDefinition) {
        return Math.max(1, Math.floor(upgrade.baseCost * Math.pow(upgrade.costGrowth, upgrade.owned)));
    }

    function isUpgradeMaxed(upgrade: UpgradeDefinition) {
        return typeof upgrade.maxPurchases === 'number' && upgrade.owned >= upgrade.maxPurchases;
    }

    function unlockAchievement(id: string) {
        const achievement = achievements.value.find(item => item.id === id);
        if (achievement) {
            achievement.unlocked = true;
            achievement.solved = true;
        }
    }

    function updateAchievements() {
        if (captchaSolvedCount.value >= 100) unlockAchievement('newbie_clicker');
        if (captchaSolvedCount.value >= 1000) unlockAchievement('exp_clicker');
        if (captchaSolvedCount.value >= 10000) unlockAchievement('master_clicker');
        if (captchaSolvedCount.value >= 100000) unlockAchievement('god_clicker');

        if (lifetimeMoneyEarned.value >= 100) unlockAchievement('pocket_change');
        if (lifetimeMoneyEarned.value >= 10000) unlockAchievement('richie_rich');
        if (lifetimeMoneyEarned.value >= 1000000) unlockAchievement('millionaire');

        if (totalMoneySpent.value >= 1000) unlockAchievement('big_spender');

        if (upgrades.value.some(upgrade => upgrade.id === 'script' && upgrade.owned > 0)) {
            unlockAchievement('tech_enthusiast');
        }

        if (maxCaptchas.value >= 3) {
            unlockAchievement('full_house');
        }

        if (upgrades.value.some(upgrade => upgrade.owned > 0)) {
            unlockAchievement('first_upgrade');
        }
    }

    function applyUpgradeEffect(upgrade: UpgradeDefinition) {
        switch (upgrade.effect) {
            case 'click_power':
                revenuePerClick.value += upgrade.effectValue;
                break;
            case 'passive_income':
                mps.value += upgrade.effectValue;
                break;
            case 'afk_income':
                afkCurrency.value += upgrade.effectValue;
                break;
            case 'verification_speed':
                verificationSpeed.value += upgrade.effectValue;
                break;
            case 'captcha_slots':
                maxCaptchas.value += upgrade.effectValue;
                break;
            case 'income_multiplier':
                incomeMultiplier.value += upgrade.effectValue;
                break;
        }
    }

    function incrementMoney(amount: number) {
        money.value = roundMoney(money.value + amount);
        lifetimeMoneyEarned.value = roundMoney(lifetimeMoneyEarned.value + amount);
        updateAchievements();
    }

    function spendMoney(amount: number) {
        if (money.value >= amount) {
            money.value = roundMoney(money.value - amount);
            totalMoneySpent.value = roundMoney(totalMoneySpent.value + amount);
            updateAchievements();
            return true;
        }
        return false;
    }

    function recordCaptchaSolved() {
        captchaSolvedCount.value += 1;
        incrementMoney(revenuePerClick.value);
    }

    function tickIncome(seconds = 1) {
        const passiveIncome = (mps.value + afkCurrency.value) * incomeMultiplier.value * seconds;
        if (passiveIncome > 0) {
            incrementMoney(passiveIncome);
        }
    }

    function calculateAfkBonus(elapsedSeconds: number) {
        const totalMinutes = Math.floor(elapsedSeconds / 60);
        if (totalMinutes <= 0) {
            return 0;
        }

        const fullHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;
        const fullHourBonus = 60 * (fullHours * (fullHours + 1)) / 2;
        const remainingBonus = remainingMinutes * (1 + fullHours);
        return fullHourBonus + remainingBonus;
    }

    function applyOfflineEarnings(now: number) {
        if (!lastActiveAt.value || now <= lastActiveAt.value) {
            return;
        }

        const elapsedSeconds = Math.min(
            OFFLINE_CAP_SECONDS,
            Math.floor((now - lastActiveAt.value) / 1000)
        );

        if (elapsedSeconds <= 0) {
            return;
        }

        const perSecondIncome = (mps.value + afkCurrency.value) * incomeMultiplier.value;
        if (perSecondIncome <= 0) {
            return;
        }

        const offlineIncome = roundMoney(perSecondIncome * elapsedSeconds * OFFLINE_RATE);
        if (offlineIncome > 0) {
            lastOfflineEarnings.value = offlineIncome;
            incrementMoney(offlineIncome);
        }
    }

    function startAfk(now = Date.now()) {
        if (afkStartAt.value === null) {
            afkStartAt.value = now;
        }
        lastActiveAt.value = now;
        saveState();
    }

    function endAfk(now = Date.now()) {
        if (afkStartAt.value === null) {
            markActive();
            return;
        }

        const elapsedSeconds = Math.max(0, Math.floor((now - afkStartAt.value) / 1000));
        lastAfkDurationSeconds.value = elapsedSeconds;
        const bonus = roundMoney(calculateAfkBonus(elapsedSeconds));
        if (bonus > 0) {
            lastOfflineEarnings.value = bonus;
            incrementMoney(bonus);
        }

        afkStartAt.value = null;
        markActive();
    }

    function buyUpgrade(upgradeId: string) {
        const upgrade = upgrades.value.find(item => item.id === upgradeId);
        if (!upgrade || isUpgradeMaxed(upgrade)) {
            return false;
        }

        const cost = getUpgradeCost(upgrade);
        if (!spendMoney(cost)) {
            return false;
        }

        upgrade.owned += 1;
        applyUpgradeEffect(upgrade);
        updateAchievements();
        return true;
    }

    function loadState() {
        if (typeof window === 'undefined') {
            return;
        }

        try {
            const rawState = window.localStorage.getItem(STORAGE_KEY);
            if (!rawState) {
                return;
            }

            const parsedState = JSON.parse(rawState) as Partial<SaveState>;

            money.value = typeof parsedState.money === 'number' ? parsedState.money : money.value;
            mps.value = typeof parsedState.mps === 'number' ? parsedState.mps : mps.value;
            afkCurrency.value = typeof parsedState.afkCurrency === 'number' ? parsedState.afkCurrency : afkCurrency.value;
            revenuePerClick.value = typeof parsedState.revenuePerClick === 'number' ? parsedState.revenuePerClick : revenuePerClick.value;
            verificationSpeed.value = typeof parsedState.verificationSpeed === 'number' ? parsedState.verificationSpeed : verificationSpeed.value;
            maxCaptchas.value = typeof parsedState.maxCaptchas === 'number' ? parsedState.maxCaptchas : maxCaptchas.value;
            incomeMultiplier.value = typeof parsedState.incomeMultiplier === 'number' ? parsedState.incomeMultiplier : incomeMultiplier.value;
            captchaSolvedCount.value = typeof parsedState.captchaSolvedCount === 'number' ? parsedState.captchaSolvedCount : captchaSolvedCount.value;
            lifetimeMoneyEarned.value = typeof parsedState.lifetimeMoneyEarned === 'number' ? parsedState.lifetimeMoneyEarned : lifetimeMoneyEarned.value;
            totalMoneySpent.value = typeof parsedState.totalMoneySpent === 'number' ? parsedState.totalMoneySpent : totalMoneySpent.value;
            lastActiveAt.value = typeof parsedState.lastActiveAt === 'number' ? parsedState.lastActiveAt : Date.now();

            if (Array.isArray(parsedState.upgrades)) {
                parsedState.upgrades.forEach(savedUpgrade => {
                    const upgrade = upgrades.value.find(item => item.id === savedUpgrade.id);
                    if (upgrade && typeof savedUpgrade.owned === 'number') {
                        upgrade.owned = savedUpgrade.owned;
                    }
                });
            }

            if (Array.isArray(parsedState.achievements)) {
                parsedState.achievements.forEach(savedAchievement => {
                    const achievement = achievements.value.find(item => item.id === savedAchievement.id);
                    if (achievement) {
                        achievement.unlocked = Boolean(savedAchievement.unlocked);
                        achievement.solved = Boolean(savedAchievement.solved);
                    }
                });
            }

            updateAchievements();
            const now = Date.now();
            applyOfflineEarnings(now);
            markActive();
        } catch {
            // Ignore malformed saves and continue with defaults.
        }
    }

    function saveState() {
        if (typeof window === 'undefined') {
            return;
        }

        const state: SaveState = {
            money: money.value,
            mps: mps.value,
            afkCurrency: afkCurrency.value,
            revenuePerClick: revenuePerClick.value,
            verificationSpeed: verificationSpeed.value,
            maxCaptchas: maxCaptchas.value,
            incomeMultiplier: incomeMultiplier.value,
            captchaSolvedCount: captchaSolvedCount.value,
            lifetimeMoneyEarned: lifetimeMoneyEarned.value,
            totalMoneySpent: totalMoneySpent.value,
            lastActiveAt: lastActiveAt.value,
            upgrades: upgrades.value.map(upgrade => ({ id: upgrade.id, owned: upgrade.owned })),
            achievements: achievements.value.map(achievement => ({
                id: achievement.id,
                unlocked: achievement.unlocked,
                solved: achievement.solved,
            })),
        };

        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    loadState();

    watch(
        [
            money,
            mps,
            afkCurrency,
            revenuePerClick,
            verificationSpeed,
            maxCaptchas,
            incomeMultiplier,
            captchaSolvedCount,
            lifetimeMoneyEarned,
            totalMoneySpent,
            upgrades,
            achievements,
        ],
        saveState,
        { deep: true }
    );

    const categorizedAchievements = computed(() => {
        const categories: Record<string, Achievement[]> = {};
        achievements.value.forEach(a => {
            if (!categories[a.category]) {
                categories[a.category] = [];
            }
            categories[a.category].push(a);
        });
        return categories;
    });

    const passiveIncome = computed(() => roundMoney((mps.value + afkCurrency.value) * incomeMultiplier.value));

    function markActive() {
        lastActiveAt.value = Date.now();
        saveState();
    }

    function clearOfflineEarnings() {
        lastOfflineEarnings.value = 0;
        lastAfkDurationSeconds.value = 0;
    }

    const categorizedUpgrades = computed(() => {
        const categories: Record<UpgradeCategory, UpgradeView[]> = {
            'basic': [],
            'automatization': [],
            'special': []
        };
        upgrades.value.forEach(u => {
            const cost = getUpgradeCost(u);
            categories[u.category].push({
                ...u,
                cost,
                canBuy: money.value >= cost && !isUpgradeMaxed(u),
                maxed: isUpgradeMaxed(u),
            });
        });
        return categories;
    });

    return {
        money,
        mps,
        afkCurrency,
        revenuePerClick,
        verificationSpeed,
        maxCaptchas,
        incomeMultiplier,
        captchaSolvedCount,
        lifetimeMoneyEarned,
        totalMoneySpent,
        lastOfflineEarnings,
        lastAfkDurationSeconds,
        achievements,
        upgrades,
        incrementMoney,
        spendMoney,
        recordCaptchaSolved,
        tickIncome,
        markActive,
        startAfk,
        endAfk,
        clearOfflineEarnings,
        buyUpgrade,
        getUpgradeCost,
        passiveIncome,
        categorizedAchievements,
        categorizedUpgrades
    };
});
