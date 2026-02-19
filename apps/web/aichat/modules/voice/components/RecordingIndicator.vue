<script setup lang="ts">


defineProps<{
  title?: string
  transcript?: string
}>()

</script>

<template>

  <div class="text-center py-8">
    <div class="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center animate-pulse">
      <Icon name="lucide:mic" class="w-8 h-8 text-red-500" />
    </div>
    <p class="text-sm text-gray-500 mt-4">{{ title }}</p>
    <p v-if="transcript" class="text-xs text-gray-400 mt-1">{{ transcript }}</p>
  </div>

</template>