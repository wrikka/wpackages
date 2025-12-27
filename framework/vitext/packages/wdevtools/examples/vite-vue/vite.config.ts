import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import unocss from 'unocss/vite';
import wdev from 'wdev';

export default defineConfig({
  plugins: [
    vue(),
    unocss(),
    wdev()
  ]
});
