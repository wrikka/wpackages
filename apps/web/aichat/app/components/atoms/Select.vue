<script setup lang="ts">


interface Option {
  label: string
  value: string
}
interface Props {
  modelValue?: string
  options: (string | Option)[]
  placeholder?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}
const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  disabled: false,
})
defineEmits<{
  'update:modelValue': [value: string]
}>()
const normalizedOptions = computed(() => {
  return props.options.map(opt => 
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  )
})
const selectClasses = computed(() => {
  const base = 'w-full appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed pr-8'
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  }
  return [base, sizes[props.size]].join(' ')
})

</script>

<template>

  <div class="relative">
    <select
      :value="modelValue"
      :disabled="disabled"
      :class="selectClasses"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option
        v-for="option in normalizedOptions"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
    <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>

</template>