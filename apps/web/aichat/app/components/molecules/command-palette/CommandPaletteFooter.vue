<template>
  <div class="p-3 px-4 border-t border-gray-200 flex justify-between items-center dark:border-gray-700">
    <div class="flex gap-4">
      <div class="flex items-center gap-1.5 text-xs text-gray-500">
        <kbd class="bg-gray-100 border border-gray-300 rounded px-1 py-0.5 font-mono text-xs dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300">↑↓</kbd>
        <span>Navigate</span>
      </div>
      <div class="flex items-center gap-1.5 text-xs text-gray-500">
        <kbd class="bg-gray-100 border border-gray-300 rounded px-1 py-0.5 font-mono text-xs dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300">Enter</kbd>
        <span>Select</span>
      </div>
      <div class="flex items-center gap-1.5 text-xs text-gray-500">
        <kbd class="bg-gray-100 border border-gray-300 rounded px-1 py-0.5 font-mono text-xs dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300">Esc</kbd>
        <span>Close</span>
      </div>
    </div>
    
    <div class="text-xs text-gray-500">
      <span v-if="isSearchMode" class="font-medium">Search Mode</span>
      <span v-else class="font-medium">Recent Actions</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CommandPaletteFooterProps {
  isSearchMode: boolean
}

defineProps<CommandPaletteFooterProps>()
</script>
