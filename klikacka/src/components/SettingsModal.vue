<script setup lang="ts">
import { ref } from 'vue';
import { useAudioStore } from '../stores/audio';
import { useGameStore } from '../stores/game';

const emit = defineEmits<{ close: [] }>();
const audio = useAudioStore();
const game = useGameStore();

const saveCode = ref('');
const importCode = ref('');
const importError = ref('');
const importSuccess = ref(false);
const exportCopied = ref(false);

function exportSave() {
    saveCode.value = game.exportSave();
    navigator.clipboard?.writeText(saveCode.value).then(() => {
        exportCopied.value = true;
        setTimeout(() => exportCopied.value = false, 2000);
    });
}

function importSave() {
    importError.value = '';
    importSuccess.value = false;
    if (!importCode.value.trim()) { importError.value = 'Paste your save code first.'; return; }
    const ok = game.importSave(importCode.value.trim());
    if (ok) { importSuccess.value = true; importCode.value = ''; }
    else { importError.value = 'Invalid save code.'; }
}
</script>

<template>
    <div class="modal-overlay" @click.self="emit('close')">
        <div class="modal-box">
            <div class="modal-titlebar">
                <span>⚙️ Settings</span>
                <button class="modal-close" @click="emit('close')">X</button>
            </div>

            <div class="modal-body">
                <!-- Audio -->
                <section class="settings-section">
                    <h3>🔊 Audio</h3>
                    <label class="setting-row">
                        <span>Music Volume</span>
                        <input type="range" min="0" max="1" step="0.05" v-model.number="audio.musicVolume" />
                        <span class="val">{{ Math.round(audio.musicVolume * 100) }}%</span>
                    </label>
                    <label class="setting-row">
                        <span>Sound Effects</span>
                        <input type="range" min="0" max="1" step="0.05" v-model.number="audio.sfxVolume" />
                        <span class="val">{{ Math.round(audio.sfxVolume * 100) }}%</span>
                    </label>
                </section>

                <!-- Visuals -->
                <section class="settings-section">
                    <h3>✨ Visuals</h3>
                    <label class="setting-row toggle-row">
                        <span>Animations</span>
                        <div class="toggle-switch" :class="{ active: audio.animationsEnabled }" @click="audio.animationsEnabled = !audio.animationsEnabled">
                            <div class="toggle-thumb"></div>
                        </div>
                    </label>
                </section>

                <!-- Save/Load -->
                <section class="settings-section">
                    <h3>💾 Save / Load</h3>
                    <div class="save-row">
                        <button class="xp-btn" @click="exportSave">{{ exportCopied ? '✅ Copied!' : '📋 Export Save' }}</button>
                        <textarea v-if="saveCode" class="save-textarea" readonly :value="saveCode" rows="3"></textarea>
                    </div>
                    <div class="save-row" style="margin-top:10px;">
                        <textarea class="save-textarea" v-model="importCode" rows="3" placeholder="Paste save code here..."></textarea>
                        <button class="xp-btn" @click="importSave">📥 Import Save</button>
                        <div v-if="importError" class="import-error">{{ importError }}</div>
                        <div v-if="importSuccess" class="import-success">✅ Save loaded!</div>
                    </div>
                </section>
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
    width: min(420px, 96vw);
    max-height: 88vh;
    display: flex; flex-direction: column;
    box-shadow: 4px 4px 16px rgba(0,0,0,0.5);
    overflow: hidden;
}
.modal-titlebar {
    background: linear-gradient(180deg, #245EDB 0%, #0058EE 100%);
    color: white;
    font-weight: bold;
    font-size: 13px;
    padding: 6px 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.modal-close {
    background: linear-gradient(180deg, #EB9287 0%, #D84F39 50%, #C43419 100%);
    border: 1px solid #fff;
    color: white;
    border-radius: 3px;
    width: 21px; height: 21px;
    cursor: pointer;
    font-size: 12px; font-weight: bold;
    display: flex; align-items: center; justify-content: center;
}
.modal-body {
    padding: 14px 16px;
    overflow-y: auto;
    flex: 1;
}
.settings-section {
    margin-bottom: 18px;
}
.settings-section h3 {
    margin: 0 0 8px;
    font-size: 12px;
    font-weight: bold;
    color: #003399;
    border-bottom: 1px solid #7F9DB9;
    padding-bottom: 4px;
}
.setting-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 12px;
    cursor: pointer;
}
.setting-row span:first-child { min-width: 110px; }
.setting-row input[type="range"] { flex: 1; }
.val { min-width: 36px; text-align: right; color: #555; font-size: 11px; }
.toggle-row { cursor: default; }
.toggle-switch {
    width: 40px; height: 20px;
    background: #ccc;
    border-radius: 10px;
    position: relative;
    cursor: pointer;
    transition: background 0.2s;
    border: 1px solid #999;
}
.toggle-switch.active { background: #2a90e9; border-color: #1a70c9; }
.toggle-thumb {
    width: 16px; height: 16px;
    background: white;
    border-radius: 50%;
    position: absolute;
    top: 1px; left: 1px;
    transition: left 0.2s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}
.toggle-switch.active .toggle-thumb { left: 21px; }
.save-row { display: flex; flex-direction: column; gap: 6px; }
.save-textarea {
    width: 100%;
    font-size: 10px;
    font-family: monospace;
    resize: none;
    border: 1px solid #7F9DB9;
    border-radius: 3px;
    padding: 4px;
    background: #f5f5f0;
    color: #333;
}
.xp-btn {
    background: linear-gradient(to bottom, #f9f9f9 0%, #e3e3e3 100%);
    border: 1px solid #7F9DB9;
    border-radius: 3px;
    padding: 5px 12px;
    font-size: 12px;
    cursor: pointer;
    color: #003399;
    font-weight: bold;
    align-self: flex-start;
}
.xp-btn:hover { background: linear-gradient(to bottom, #e8eeff, #d0d8f8); }
.import-error { color: #cc2200; font-size: 11px; }
.import-success { color: #007700; font-size: 11px; font-weight: bold; }
</style>
