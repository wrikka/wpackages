<script setup lang="ts">

import { computed } from 'vue'

interface TabsProps {
  modelValue?: string
  defaultValue?: string
  class?: string
}

const props = withDefaults(defineProps<TabsProps>(), {
  defaultValue: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const modelValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

</script>

<template>

  <div :class="props.class">
    <slot />
  </div>

</template>