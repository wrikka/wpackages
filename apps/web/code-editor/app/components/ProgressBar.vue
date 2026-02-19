<script setup lang="ts">

 import { computed } from 'vue'

const props = defineProps<{ label?: string; value: number }>()

const label = computed(() => props.label ?? 'Progress')

</script>

<template>

  <div class="w-full">
    <div class="flex items-center justify-between text-xs mb-1">
      <span class="text-gray-600 dark:text-gray-300">{{ label }}</span>
      <span class="text-gray-600 dark:text-gray-300 tabular-nums">{{ value }}%</span>
    </div>
    <div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded">
      <div
        class="h-2 bg-blue-500 rounded"
        :style="{ width: `${value}%` }"
      />
    </div>
  </div>

</template>