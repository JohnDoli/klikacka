import { createRouter, createWebHistory } from 'vue-router';
import GameView from '../views/GameView.vue';
import StatsView from '../views/StatsView.vue';
import LeaderboardView from '../views/LeaderboardView.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', name: 'game', component: GameView },
        { path: '/stats', name: 'stats', component: StatsView },
        { path: '/leaderboard', name: 'leaderboard', component: LeaderboardView },
    ],
});

export default router;
