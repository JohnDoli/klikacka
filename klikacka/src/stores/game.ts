import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
    solved: boolean;
    category: string;
}

export interface Upgrade {
    id: string;
    name: string;
    description: string;
    cost: number;
    level: number;
    category: 'basic' | 'automatization' | 'special';
    disabled?: boolean;
}

export const useGameStore = defineStore('game', () => {
    const money = ref(0);
    const mps = ref(0);
    
    // Config
    const revenuePerClick = ref(1);
    const verificationSpeed = ref(1.0);
    const maxCaptchas = ref(1);

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

    const upgrades = ref<Upgrade[]>([
        { id: 'verification_speed', name: 'Verification Speed', description: 'Reduces time to verify a captcha.', cost: 15, level: 0, category: 'basic', disabled: false },
        { id: 'captcha_slots', name: 'Captcha Slots', description: 'Increases max number of visible captchas.', cost: 100, level: 1, category: 'basic', disabled: false },
        { id: 'additional_captcha', name: 'Additional Captcha', description: 'Adds another active captcha button.', cost: 50, level: 1, category: 'basic', disabled: false },
        { id: 'revenue_per_click', name: 'Revenue per Click', description: 'Increase money earned per solved captcha.', cost: 25, level: 1, category: 'basic', disabled: false },
        { id: 'script', name: 'Script', description: 'Automatically clicks captcha occasionally.', cost: 150, level: 0, category: 'automatization', disabled: true },
        { id: 'bot', name: 'Bot', description: 'A more advanced auto-clicker.', cost: 500, level: 0, category: 'automatization', disabled: true },
        { id: 'server_farm', name: 'Server Farm', description: 'Generates passive income over time.', cost: 2000, level: 0, category: 'automatization', disabled: true },
        { id: 'golden_chance', name: 'Golden Chance', description: 'Increases chance of Golden Captcha spawning.', cost: 1000, level: 0, category: 'special', disabled: true },
        { id: 'bonus_duration', name: 'Bonus Duration', description: 'Golden Captcha effects last longer.', cost: 1500, level: 0, category: 'special', disabled: true },
        { id: 'income_multiplier', name: 'Income Multiplier', description: 'Permanently multiplies all income.', cost: 5000, level: 0, category: 'special', disabled: true },
    ]);

    function incrementMoney(amount: number) {
        money.value += amount;
    }

    function spendMoney(amount: number) {
        if (money.value >= amount) {
            money.value -= amount;
            return true;
        }
        return false;
    }

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

     const categorizedUpgrades = computed(() => {
        const categories: Record<string, Upgrade[]> = {
            'basic': [],
            'automatization': [],
            'special': []
        };
        upgrades.value.forEach(u => {
            if (categories[u.category]) {
                categories[u.category].push(u);
            }
        });
        return categories;
    });

    return {
        money,
        mps,
        revenuePerClick,
        verificationSpeed,
        maxCaptchas,
        achievements,
        upgrades,
        incrementMoney,
        spendMoney,
        categorizedAchievements,
        categorizedUpgrades
    };
});
