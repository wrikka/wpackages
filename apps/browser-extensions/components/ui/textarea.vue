<script setup lang="ts">

import { computed } from 'vue'

interface TextareaProps {
  modelValue?: string
  placeholder?: string
  class?: string
  rows?: number
  disabled?: boolean
  readonly?: boolean
}

const props = withDefaults(defineProps<TextareaProps>(), {
  rows: 3
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const modelValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const textareaClasses = computed(() => {
  const base = 'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
  return `${base} ${props.class || ''}`
})

</script>

<template>

  <textarea
    v-model="modelValue"
    :placeholder="placeholder"
    :rows="rows"
    :disabled="disabled"
    :readonly="readonly"
    :class="textareaClasses"
  />

</template>