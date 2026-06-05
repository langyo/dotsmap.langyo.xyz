import { resolve } from 'path';
import { defineConfig } from 'vite';
import vueSfc from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import UnoCSS from 'unocss/vite';
export default defineConfig({
    plugins: [vueSfc(), vueJsx(), UnoCSS()],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
    base: './',
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
});
