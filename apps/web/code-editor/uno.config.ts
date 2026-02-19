import { defineConfig, presetIcons, presetWind4, transformerVariantGroup, transformerDirectives, transformerCompileClass } from 'unocss'

export default defineConfig({
  presets: [
    presetWind4({
      preflights: {
        reset: true,
      },
    }),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
  ],
  transformers: [
    transformerVariantGroup(),
    transformerDirectives(),
    transformerCompileClass(),
  ],
  theme: {
    colors: {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
        950: '#172554',
      },
    },
  },
  shortcuts: [
    // Button shortcuts
    ['btn', 'px-4 py-2 rounded-lg font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors'],
    ['btn-soft', 'px-4 py-2 rounded-lg font-medium bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors'],
    ['btn-outline', 'px-4 py-2 rounded-lg font-medium border border-primary-300 text-primary-700 hover:bg-primary-50 transition-colors'],
    
    // Card shortcuts
    ['card', 'bg-white rounded-lg shadow-sm border border-gray-200 p-6'],
    ['card-header', 'flex items-center justify-between mb-4'],
    
    // Layout shortcuts
    ['container', 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'],
    ['flex-between', 'flex items-center justify-between'],
    ['flex-center', 'flex items-center justify-center'],
    
    // Form shortcuts
    ['input', 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'],
    ['label', 'block text-sm font-medium text-gray-700 mb-1'],
    
    // Status badges
    ['badge-success', 'px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800'],
    ['badge-warning', 'px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800'],
    ['badge-error', 'px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800'],
  ],
})
