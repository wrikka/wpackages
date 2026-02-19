<script setup lang="ts">


defineProps<{
  color: string
}>()

</script>

<template>

  <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
    <div class="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
      <span class="text-sm font-medium">Preview</span>
    </div>
    <div class="h-48 bg-gray-100 dark:bg-gray-900 relative p-4">
      <div class="h-full bg-white dark:bg-gray-800 rounded shadow-sm p-4">
        <div class="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div class="h-3 w-full bg-gray-100 dark:bg-gray-700 rounded mb-1" />
        <div class="h-3 w-2/3 bg-gray-100 dark:bg-gray-700 rounded" />
      </div>
      <div
        class="absolute bottom-8 right-8 w-12 h-12 rounded-full shadow-lg flex items-center justify-center"
        :style="{ backgroundColor: color }"
      >
        <Icon name="lucide:message-square" class="w-6 h-6 text-white" />
      </div>
    </div>
  </div>

</template>