<script setup lang="ts">

import { useColorMode } from '#imports'

const appConfig = useAppConfig();
const colorMode = useColorMode();
const primaryColors = [
  { name: 'green', hex: '#22c55e' },
  { name: 'blue', hex: '#3b82f6' },
  { name: 'red', hex: '#ef4444' },
  { name: 'orange', hex: '#f97316' },
  { name: 'purple', hex: '#8b5cf6' },
  { name: 'teal', hex: '#14b8a6' },
];
const setColorMode = (mode: 'system' | 'light' | 'dark') => {
  colorMode.preference = mode;
};
const setPrimaryColor = (color: string) => {
  appConfig.ui.primary = color;
};

</script>

<template>

  <div class="theme-switcher-container space-y-4">
    <div>
      <h4 class="font-medium mb-2">Color Mode</h4>
      <div class="flex items-center space-x-2">
        <button @click="setColorMode('system')" :class="{ 'ring-2 ring-primary-500': $colorMode.preference === 'system' }" class="p-2 rounded-md border">
          System
        </button>
        <button @click="setColorMode('light')" :class="{ 'ring-2 ring-primary-500': $colorMode.preference === 'light' }" class="p-2 rounded-md border">
          Light
        </button>
        <button @click="setColorMode('dark')" :class="{ 'ring-2 ring-primary-500': $colorMode.preference === 'dark' }" class="p-2 rounded-md border">
          Dark
        </button>
      </div>
    </div>

    <div>
      <h4 class="font-medium mb-2">Primary Color</h4>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="color in primaryColors"
          :key="color.name"
          @click="setPrimaryColor(color.name)"
          class="w-8 h-8 rounded-full border-2 transition-transform transform hover:scale-110"
          :style="{ backgroundColor: color.hex }"
          :class="[appConfig.ui.primary === color.name ? 'ring-2 ring-offset-2' : '']"
          :title="color.name"
        ></button>
      </div>
    </div>
  </div>

</template>