import {createRouter, createWebHistory} from 'vue-router';
import Game from '../components/Game.vue';

export const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'Game Client',
            component: Game,
        },
        {
            path: '/sso/:sso',
            name: 'Game Client with SSO',
            component: Game,
        },
    ],
});
