import {createRouter, createWebHistory} from 'vue-router';
import {config} from '../../game/configuration/Configuration';
import {hasCredentials, logout} from '../../game/auth/session';

// loaded on demand: the login page does not load the engine and the styles of the game
const Game = () => import('../components/Game.vue');
const LoginPage = () => import('../components/auth/LoginPage.vue');

export const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'Game Client',
            component: Game,
            meta: {game: true},
        },
        {
            // the legacy SSO (the user id): only with config.auth.legacySso
            path: '/sso/:sso',
            name: 'Game Client with SSO',
            component: Game,
            meta: {game: true, legacySso: true},
        },
        {
            // the link of a room (room tools > Link to this room): logged with the credentials of this browser
            path: '/room/:roomId',
            name: 'Game Client in a room',
            component: Game,
            meta: {game: true},
        },
        {
            path: '/login',
            name: 'Login',
            component: LoginPage,
            props: {mode: 'login'},
        },
        {
            path: '/register',
            name: 'Register',
            component: LoginPage,
            props: {mode: 'register'},
        },
        {
            path: '/logout',
            name: 'Logout',
            redirect: () => {
                logout();
                return {path: '/login'};
            },
        },
    ],
});

router.beforeEach(to => {
    // config.auth.loginRequired: the game only after the login (or with the legacy SSO). Not tied to offlineMode
    if (!to.meta.game || !config.auth.loginRequired) return true;

    if (to.meta.legacySso) return config.auth.legacySso ? true : {path: '/login'};

    if (hasCredentials()) return true;

    // after the login back here (e.g. the link of a room)
    return {path: '/login', query: to.fullPath !== '/' ? {redirect: to.fullPath} : {}};
});
