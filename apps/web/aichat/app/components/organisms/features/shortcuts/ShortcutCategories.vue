<script setup lang="ts">

import type { ShortcutCategory } from './types'

defineProps<{
  categories: ShortcutCategory[]
}>()

</script>

<template>

  <div class="space-y-6 max-h-[60vh] overflow-y-auto">
    <div v-for="category in categories" :key="category.name" class="space-y-3">
      <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ category.name }}</h4>
      <div class="space-y-2">
        <ShortcutItem
          v-for="shortcut in category.shortcuts"
          :key="shortcut.key"
          :shortcut="shortcut"
        />
      </div>
    </div>
  </div>

</template>