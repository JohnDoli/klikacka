import { createRouter, createWebHistory } from 'vue-router';
import GameView from '../views/GameView.vue';
import StatsView from '../views/StatsView.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', name: 'game', component: GameView },
        { path: '/stats', name: 'stats', component: StatsView },
    ],
});

export default router;
