import { fileURLToPath } from 'node:url'
import { resolve } from 'path'

export default defineNuxtConfig({
  compatibilityDate: '2025-02-01',
  future: {
    compatibilityVersion: 4,
  },
  srcDir: 'app/',
  devtools: { enabled: true },
  typescript: {
    strict: true,
  },
  modules: [
    '@unocss/nuxt',
  ],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    // Private keys (only available on server-side)
    databaseUrl: process.env.DATABASE_URL,
    // Public keys (exposed to client-side)
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || '/api',
    },
  },
  nitro: {
    experimental: {
      wasm: true,
    },
  },
  vite: {
    optimizeDeps: {
      exclude: ['drizzle-orm'],
    },
  },
  alias: {
    '@shared': fileURLToPath(new URL('./shared', import.meta.url)),
  },
});
