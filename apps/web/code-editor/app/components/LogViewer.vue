<script setup lang="ts">

defineEmits<{ clear: [] }>()

defineProps<{ lines: string[] }>()

</script>

<template>

  <div class="h-full flex flex-col">
    <div class="flex items-center justify-between mb-2">
      <h2 class="text-lg font-bold">Logs</h2>
      <button
        class="text-sm px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
        @click="$emit('clear')"
      >
        Clear
      </button>
    </div>

    <div class="flex-1 bg-black text-white rounded p-3 overflow-auto font-mono text-xs">
      <pre v-if="lines.length">{{ lines.join('\n') }}</pre>
      <div v-else class="text-gray-400">No logs.</div>
    </div>
  </div>

</template>