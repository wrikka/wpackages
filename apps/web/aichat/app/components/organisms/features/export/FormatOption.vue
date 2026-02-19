<script setup lang="ts">


interface Format {
  value: string
  label: string
  extension: string
  icon: string
}
const formats = [
  { value: 'markdown', label: 'Markdown', extension: 'md', icon: 'file-text' },
  { value: 'json', label: 'JSON', extension: 'json', icon: 'code' },
  { value: 'txt', label: 'Plain Text', extension: 'txt', icon: 'file' },
]
defineProps<{
  format: Format
  isSelected: boolean
}>()
defineEmits<{
  select: [value: string]
}>()

</script>

<template>

  <button
    class="flex flex-col items-center p-4 border rounded-lg transition-all duration-200"
    :class="isSelected 
      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'"
    @click="$emit('select', format.value)"
  >
    <Icon :name="format.icon" class="w-8 h-8 mb-2" :class="isSelected ? 'text-blue-500' : 'text-gray-500'" />
    <span class="text-sm font-medium">{{ format.label }}</span>
    <span class="text-xs text-gray-500">.{{ format.extension }}</span>
  </button>

</template>