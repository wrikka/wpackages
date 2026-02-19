import { resolve } from 'node:path';
import checker from 'vite-plugin-checker';
import { validateEnv } from './server/utils/env';

// Validate environment variables on startup (skip in test mode)
if (process.env.NODE_ENV !== 'test') {
  validateEnv(process.env);
}

export default defineNuxtConfig({
  compatibilityDate: '2025-02-01',

  alias: {
    '@aichat/config': resolve('./server/utils/env'),
    '@aichat/db': resolve('./server/db'),
  },

  future: {
    compatibilityVersion: 4,
  },

  devtools: {
    enabled: true,
  },


  modules: [
    '@vue-macros/nuxt',
    '@nuxtjs/color-mode',
    '@vueuse/nuxt',
    '@unocss/nuxt',
    '@pinia/nuxt',
    '@nuxt/ui',
    '@nuxt/icon',
    '@scalar/nuxt',
    '~/modules/aichatinput',
    '~/modules/chat',
    '~/modules/voice',
    '~/modules/plugins',
    '~/modules/file-management',
  ],

  scalar: {
    url: 'https://registry.scalar.com/@scalar/apis/galaxy?format=yaml',
  },

  typescript: {
    strict: true,
    typeCheck: true,
  },

  colorMode: {
    preference: 'system',
    fallback: 'light',
    classSuffix: '',
  },

  icon: {
    serverBundle: {
      collections: ['mdi', 'carbon', 'heroicons'],
    },
  },

  css: [
    '~/assets/css/main.css',
  ],

  app: {
    head: {
      title: 'AI Chatbot',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'AI Chatbot Application' },
        { name: 'theme-color', content: '#3b82f6' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'manifest', href: '/manifest.json' },
      ],
    },
  },

  runtimeConfig: {
    d1DatabasePath: process.env.D1_DATABASE_PATH || '',
    githubClientId: process.env.GITHUB_CLIENT_ID || '',
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    extensionToken: process.env.AICHAT_EXTENSION_TOKEN || '',
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
    },
  },

  nitro: {
    experimental: {
      openAPI: true,
    },
  },

  vite: {
    plugins: [
      checker({
        overlay: {
          initialIsOpen: false,
        },
        typescript: true,
        vueTsc: true,
        oxlint: true,
      }) as any,
    ],
    optimizeDeps: {
      include: ['@vueuse/core'],
    },
  },
});
