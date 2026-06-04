import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

const AUDIO_STORAGE_KEY = 'klikacka-audio-settings-v1';

export const useAudioStore = defineStore('audio', () => {
    const musicVolume = ref(0.4);
    const sfxVolume = ref(0.7);
    const animationsEnabled = ref(true);

    // Audio objects
    let bgMusic1: HTMLAudioElement | null = null;
    let bgMusic2: HTMLAudioElement | null = null;
    let currentTrack = ref(0); // 0 or 1
    let musicStarted = ref(false);

    const buySfx = new Audio('/sounds/buy.mp3');
    const correctSfx = new Audio('/sounds/correct.mp3');
    const yeeySfx = new Audio('/sounds/yeey.mp3');

    function loadSettings() {
        try {
            const raw = localStorage.getItem(AUDIO_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (typeof parsed.musicVolume === 'number') musicVolume.value = parsed.musicVolume;
                if (typeof parsed.sfxVolume === 'number') sfxVolume.value = parsed.sfxVolume;
                if (typeof parsed.animationsEnabled === 'boolean') animationsEnabled.value = parsed.animationsEnabled;
            }
        } catch {}
    }

    function saveSettings() {
        localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify({
            musicVolume: musicVolume.value,
            sfxVolume: sfxVolume.value,
            animationsEnabled: animationsEnabled.value,
        }));
    }

    function initMusic() {
        if (bgMusic1) return;
        bgMusic1 = new Audio('/sounds/background-music.mp3');
        bgMusic2 = new Audio('/sounds/background-music2.mp3');
        bgMusic1.loop = false;
        bgMusic2.loop = false;
        bgMusic1.volume = musicVolume.value;
        bgMusic2.volume = musicVolume.value;

        bgMusic1.addEventListener('ended', () => {
            currentTrack.value = 1;
            bgMusic2!.currentTime = 0;
            bgMusic2!.volume = musicVolume.value;
            bgMusic2!.play().catch(() => {});
        });
        bgMusic2.addEventListener('ended', () => {
            currentTrack.value = 0;
            bgMusic1!.currentTime = 0;
            bgMusic1!.volume = musicVolume.value;
            bgMusic1!.play().catch(() => {});
        });
    }

    function startMusic() {
        initMusic();
        if (musicStarted.value) return;
        musicStarted.value = true;
        currentTrack.value = 0;
        bgMusic1!.volume = musicVolume.value;
        bgMusic1!.play().catch(() => {});
    }

    function stopMusic() {
        bgMusic1?.pause();
        bgMusic2?.pause();
        musicStarted.value = false;
    }

    function playSfx(type: 'buy' | 'correct' | 'yeey') {
        const map = { buy: buySfx, correct: correctSfx, yeey: yeeySfx };
        const audio = map[type];
        audio.volume = sfxVolume.value;
        audio.currentTime = 0;
        audio.play().catch(() => {});
    }

    watch(musicVolume, (v) => {
        if (bgMusic1) bgMusic1.volume = v;
        if (bgMusic2) bgMusic2.volume = v;
        saveSettings();
    });

    watch(sfxVolume, saveSettings);
    watch(animationsEnabled, saveSettings);

    loadSettings();

    return {
        musicVolume,
        sfxVolume,
        animationsEnabled,
        musicStarted,
        startMusic,
        stopMusic,
        playSfx,
    };
});