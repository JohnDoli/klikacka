<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useGameStore } from '../stores/game';

const store = useGameStore();

interface Entry {
    name: string;
    score: number;
    prestige: number;
    captchas: number;
}

const entries = ref<Entry[]>([]);
const loading = ref(false);
const submitting = ref(false);
const playerName = ref('');
const submitMsg = ref('');
const error = ref('');

const STORAGE_KEY_PREFIX = 'leaderboard-captchaclicker';

async function loadLeaderboard() {
    loading.value = true;
    error.value = '';
    try {
        const result = await window.storage.list(STORAGE_KEY_PREFIX + ':');
        const keys = result?.keys ?? [];
        const loaded: Entry[] = [];
        for (const key of keys) {
            try {
                const val = await window.storage.get(key, true);
                if (val?.value) loaded.push(JSON.parse(val.value));
            } catch {}
        }
        entries.value = loaded.sort((a, b) => b.score - a.score).slice(0, 20);
    } catch (e) {
        error.value = 'Could not load leaderboard.';
    }
    loading.value = false;
}

async function submitScore() {
    if (!playerName.value.trim()) { submitMsg.value = 'Enter your name first!'; return; }
    submitting.value = true;
    submitMsg.value = '';
    try {
        const entry: Entry = {
            name: playerName.value.trim().slice(0, 24),
            score: Math.floor(store.lifetimeMoneyEarned),
            prestige: store.prestigeCount,
            captchas: store.captchaSolvedCount,
        };
        const key = `${STORAGE_KEY_PREFIX}:${playerName.value.trim().toLowerCase().replace(/\s+/g,'-').slice(0,20)}`;
        await window.storage.set(key, JSON.stringify(entry), true);
        submitMsg.value = '✅ Score submitted!';
        await loadLeaderboard();
    } catch {
        submitMsg.value = '❌ Failed to submit.';
    }
    submitting.value = false;
}

function fmt(n: number) {
    if (n >= 1_000_000) return `$${(n/1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n/1_000).toFixed(1)}K`;
    return `$${n}`;
}

onMounted(loadLeaderboard);
</script>

<template>
    <div class="xp-content">
        <div class="stats-panel">
            <h2>🏆 Leaderboard</h2>
            <p style="font-size:11px;color:#666;margin:0 0 12px;">Shared leaderboard — scores are public.</p>

            <div class="submit-row">
                <input
                    class="name-input"
                    v-model="playerName"
                    placeholder="Your name..."
                    maxlength="24"
                />
                <button class="xp-btn" @click="submitScore" :disabled="submitting">
                    {{ submitting ? '...' : '📤 Submit Score' }}
                </button>
                <span v-if="submitMsg" class="submit-msg">{{ submitMsg }}</span>
            </div>

            <div v-if="loading" class="lb-loading">Loading...</div>
            <div v-else-if="error" class="lb-error">{{ error }}</div>
            <div v-else>
                <table class="lb-table" v-if="entries.length > 0">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Lifetime $</th>
                            <th>Prestige</th>
                            <th>Captchas</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(e, i) in entries" :key="i" :class="{ 'top-3': i < 3 }">
                            <td class="rank">{{ i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i+1 }}</td>
                            <td>{{ e.name }}</td>
                            <td>{{ fmt(e.score) }}</td>
                            <td>{{ e.prestige }}</td>
                            <td>{{ e.captchas?.toLocaleString() ?? '-' }}</td>
                        </tr>
                    </tbody>
                </table>
                <div v-else class="lb-empty">No scores yet. Be the first!</div>
            </div>

            <button class="xp-btn refresh-btn" @click="loadLeaderboard" :disabled="loading">🔄 Refresh</button>
        </div>
    </div>
</template>

<style scoped>
.submit-row {
    display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 14px;
}
.name-input {
    border: 1px solid #7F9DB9; border-radius: 3px; padding: 5px 8px;
    font-size: 12px; width: 140px; background: #fff;
}
.xp-btn {
    background: linear-gradient(to bottom, #f9f9f9, #e3e3e3);
    border: 1px solid #7F9DB9; border-radius: 3px;
    padding: 5px 10px; font-size: 12px; cursor: pointer; color: #003399; font-weight: bold;
}
.xp-btn:disabled { opacity: 0.5; cursor: default; }
.xp-btn:hover:not(:disabled) { background: linear-gradient(to bottom, #e8eeff, #d0d8f8); }
.submit-msg { font-size: 11px; color: #007700; }
.lb-loading, .lb-empty { font-size: 12px; color: #666; padding: 12px 0; }
.lb-error { font-size: 12px; color: #cc2200; padding: 12px 0; }
.lb-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 12px; }
.lb-table th {
    background: linear-gradient(to bottom, #245EDB, #0058EE);
    color: white; padding: 5px 8px; text-align: left; font-size: 11px;
}
.lb-table td { padding: 5px 8px; border-bottom: 1px solid #ddd; }
.lb-table tr:hover td { background: #f0f0e8; }
.top-3 td { font-weight: bold; background: #fffbea; }
.rank { font-size: 14px; text-align: center; }
.refresh-btn { margin-top: 4px; }
</style>
