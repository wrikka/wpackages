import { defineConfig } from 'vite';
import wserver from 'wserver';

export default defineConfig({
  plugins: [
    wserver({
      // All options are default
    }),
  ],
});
