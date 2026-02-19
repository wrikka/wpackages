<script setup lang="ts">

import { computed, ref } from 'vue'

interface SelectProps {
  modelValue?: string | number
  placeholder?: string
  disabled?: boolean
  class?: string
}

interface SelectTriggerProps {
  class?: string
}

interface SelectContentProps {
  class?: string
}

interface SelectItemProps {
  value: string | number
  disabled?: boolean
  class?: string
}

const props = withDefaults(defineProps<SelectProps>(), {
  placeholder: 'Select an option'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const isOpen = ref(false)
const selectedValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const triggerClasses = computed(() => {
  const base = 'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
  return `${base} ${props.class || ''}`
})

const contentClasses = computed(() => {
  const base = 'relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md'
  return `${base}`
})

const itemClasses = computed(() => {
  const base = 'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
  return `${base}`
})

</script>

<template>

  <div class="relative">
    <div :class="triggerClasses" @click="isOpen = !isOpen">
      <span class="block truncate">{{ selectedValue || placeholder }}</span>
      <svg class="ml-2 h-4 w-4 shrink-0 opacity-50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
    
    <div v-if="isOpen" :class="contentClasses" class="absolute top-full left-0 mt-1 w-full">
      <slot />
    </div>
  </div>

</template>