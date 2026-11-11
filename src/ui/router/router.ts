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
        {
            // the link of a room (room tools > Link to this room): logged with the SSO of this browser
            path: '/room/:roomId',
            name: 'Game Client in a room',
            component: Game,
        },
    ],
});
