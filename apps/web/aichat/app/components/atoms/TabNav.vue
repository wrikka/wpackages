<script setup lang="ts">


defineProps<{
  modelValue: string
  tabs: string[]
}>()
defineEmits<{
  'update:modelValue': [value: string]
}>()

</script>

<template>

  <div class="tabs flex gap-2 mb-4 border-b border-gray-200 dark:border-gray-700">
    <button
      v-for="tab in tabs"
      :key="tab"
      class="pb-2 px-2 text-sm capitalize transition-colors"
      :class="modelValue === tab 
        ? 'border-b-2 border-blue-500 text-blue-600' 
        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'"
      @click="$emit('update:modelValue', tab)"
    >
      {{ tab }}
    </button>
  </div>

</template>