<script setup lang="ts">

import { useAppearance } from '~/app/composables/useAppearance';

const { fontSize, increaseFontSize, decreaseFontSize, resetFontSize } = useAppearance();

</script>

<template>

  <div>
    <h4 class="font-medium mb-2">Font Size</h4>
    <div class="flex items-center space-x-2">
      <button @click="decreaseFontSize" class="p-2 rounded-md border">-</button>
      <span class="w-12 text-center">{{ fontSize }}px</span>
      <button @click="increaseFontSize" class="p-2 rounded-md border">+</button>
      <button @click="resetFontSize" class="p-2 rounded-md border">Reset</button>
    </div>
  </div>

</template>