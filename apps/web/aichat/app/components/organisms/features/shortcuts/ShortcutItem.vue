<script setup lang="ts">

import type { Shortcut } from './types'

defineProps<{
  shortcut: Shortcut
}>()

</script>

<template>

  <div class="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
    <span class="text-sm">{{ shortcut.description }}</span>
    <div class="flex items-center gap-1">
      <kbd
        v-for="key in shortcut.keys"
        :key="key"
        class="px-2 py-1 text-xs font-mono bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded shadow-sm"
      >
        {{ key }}
      </kbd>
    </div>
  </div>

</template>