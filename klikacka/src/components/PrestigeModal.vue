<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '../stores/game';
import { useAudioStore } from '../stores/audio';

const emit = defineEmits<{ close: []; prestiged: [] }>();
const game = useGameStore();
const audio = useAudioStore();

const nextMultiplier = computed(() => 1 + (game.prestigeCount + 1) * 0.25);
const requirement = computed(() => game.prestigeRequirement());
const canPrestige = computed(() => game.canPrestige());

function doPrestige() {
    if (!canPrestige.value) return;
    game.doPrestige();
    audio.playSfx('yeey');
    emit('prestiged');
    emit('close');
}

function fmt(n: number) {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
    return `$${Math.floor(n)}`;
}
</script>

<template>
    <div class="modal-overlay" @click.self="emit('close')">
        <div class="modal-box prestige-box">
            <div class="modal-titlebar">
                <span>🔄 Prestige</span>
                <button class="modal-close" @click="emit('close')">X</button>
            </div>
            <div class="modal-body">
                <div class="prestige-info">
                    <div class="prestige-count">
                        <span class="big-num">{{ game.prestigeCount }}</span>
                        <span class="label">Prestiges done</span>
                    </div>
                    <div class="prestige-multiplier">
                        <span class="big-num">×{{ game.prestigeMultiplier.toFixed(2) }}</span>
                        <span class="label">Current income bonus</span>
                    </div>
                </div>

                <div class="prestige-divider"></div>

                <p class="prestige-desc">
                    Resetting the game grants a permanent income multiplier.
                    All upgrades and money reset, but <strong>achievements are kept</strong>.
                </p>

                <div class="prestige-next">
                    <div class="row">
                        <span>Requirement:</span>
                        <span :class="{ 'met': canPrestige }">{{ fmt(requirement) }} lifetime earned</span>
                    </div>
                    <div class="row">
                        <span>Your progress:</span>
                        <span>{{ fmt(game.lifetimeMoneyEarned) }}</span>
                    </div>
                    <div class="row">
                        <span>Next bonus:</span>
                        <span class="bonus">×{{ nextMultiplier.toFixed(2) }} income</span>
                    </div>
                </div>

                <div v-if="!canPrestige" class="prestige-warning">
                    ⚠️ You need {{ fmt(requirement) }} lifetime earnings to prestige.
                    Currently: {{ fmt(game.lifetimeMoneyEarned) }}
                </div>

                <button
                    class="prestige-btn"
                    :class="{ 'disabled': !canPrestige }"
                    @click="doPrestige"
                >
                    🔄 Prestige Now
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.55);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000;
}
.modal-box {
    background: #ECE9D8;
    border: 2px solid #245EDB;
    border-radius: 6px;
    width: min(380px, 96vw);
    box-shadow: 4px 4px 16px rgba(0,0,0,0.5);
    overflow: hidden;
}
.modal-titlebar {
    background: linear-gradient(180deg, #245EDB 0%, #0058EE 100%);
    color: white; font-weight: bold; font-size: 13px;
    padding: 6px 10px;
    display: flex; justify-content: space-between; align-items: center;
}
.modal-close {
    background: linear-gradient(180deg, #EB9287 0%, #D84F39 50%, #C43419 100%);
    border: 1px solid #fff; color: white; border-radius: 3px;
    width: 21px; height: 21px; cursor: pointer; font-size: 12px;
    font-weight: bold; display: flex; align-items: center; justify-content: center;
}
.modal-body { padding: 16px; }
.prestige-info {
    display: flex; gap: 16px; justify-content: center; margin-bottom: 12px;
}
.prestige-count, .prestige-multiplier {
    display: flex; flex-direction: column; align-items: center;
    background: white; border: 1px solid #ccc; border-radius: 6px;
    padding: 10px 16px; flex: 1;
}
.big-num { font-size: 26px; font-weight: bold; color: #003399; }
.label { font-size: 10px; color: #666; text-align: center; }
.prestige-divider { border-top: 1px solid #ccc; margin: 12px 0; }
.prestige-desc { font-size: 12px; color: #444; margin: 0 0 12px; line-height: 1.5; }
.prestige-next { background: white; border: 1px solid #ccc; border-radius: 4px; padding: 10px; margin-bottom: 12px; }
.row { display: flex; justify-content: space-between; font-size: 12px; padding: 3px 0; }
.row span:first-child { color: #666; }
.met { color: #007700; font-weight: bold; }
.bonus { color: #cc6600; font-weight: bold; }
.prestige-warning { font-size: 11px; color: #cc2200; margin-bottom: 10px; }
.prestige-btn {
    width: 100%;
    background: linear-gradient(to bottom, #ffd778, #ffbf47);
    border: 1px solid #e6b800;
    color: #5a3a00;
    font-weight: bold; font-size: 13px;
    padding: 10px; border-radius: 4px; cursor: pointer;
    transition: filter 0.15s;
}
.prestige-btn:hover:not(.disabled) { filter: brightness(1.05); }
.prestige-btn.disabled { opacity: 0.5; cursor: not-allowed; }
</style>
