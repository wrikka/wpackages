<script setup lang="ts">


interface Props {
  modelValue?: string
  placeholder?: string
  rows?: number
  disabled?: boolean
  error?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  rows: 3,
  disabled: false,
  error: false,
})
defineEmits<{
  'update:modelValue': [value: string]
}>()
const textareaClasses = computed(() => {
  const base = 'w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed resize-y'
  const errorClasses = props.error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
  return [base, errorClasses].join(' ')
})

</script>

<template>

  <textarea
    :value="modelValue"
    :placeholder="placeholder"
    :rows="rows"
    :disabled="disabled"
    :class="textareaClasses"
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />

</template>