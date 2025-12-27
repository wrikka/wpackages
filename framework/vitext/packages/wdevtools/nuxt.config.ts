import { defineNuxtConfig } from 'nuxt/config';
import checker from 'vite-plugin-checker';

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: [
    'nuxt-mcp-dev',
    '@pinia/nuxt',
    '@unocss/nuxt',
    '@nuxt/icon',
    '@vueuse/nuxt',
    '@nuxtjs/color-mode',
    '@vue-macros/nuxt',
  ],
  nitro: {
    preset: 'cloudflare_module',
    cloudflare: {
      deployConfig: false,
      nodeCompat: true,
      routes: [
        {
          pattern: 'wdevtools.wrikka.com',
          custom_domain: true,
        },
      ],
    },
  },
  icon: {
    serverBundle: {
      collections: ['mdi'],
    },
  },

  typescript: {
    typeCheck: false,
    strict: true,
  },
  vite: {
    // plugins: [
    //   checker({
    //     overlay: {
    //       initialIsOpen: false,
    //     },
    //     typescript: true,
    //     vueTsc: true,
    //     oxlint: true,
    //   }),
    // ],
  },
});
