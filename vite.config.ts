import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        host: '127.0.0.1',
        port: 3005,
        hmr: false,
        // development (nhg-server/docker-compose.dev.yml): the same paths as nginx in production
        proxy: {
            '/nhg/game': {target: 'ws://127.0.0.1:8083', ws: true},
            '/api/v1/accounts': 'http://127.0.0.1:8086',
            '/nitro': 'http://127.0.0.1:8080',
            '/nhg-assets': 'http://127.0.0.1:8080',
        },
    },
    plugins: [vue()],
    
});
