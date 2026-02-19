<script setup lang="ts">


interface Props {
  modelValue: boolean
  width?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  closeOnBackdrop?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  width: 'md',
  closeOnBackdrop: true,
})
defineEmits<{
  'update:modelValue': [value: boolean]
}>()
const widthClass = computed(() => {
  const widths = {
    sm: 'w-full max-w-sm',
    md: 'w-full max-w-md',
    lg: 'w-full max-w-lg',
    xl: 'w-full max-w-xl',
    '2xl': 'w-full max-w-2xl',
    'full': 'w-full max-w-5xl',
  }
  return widths[props.width]
})
// Lock body scroll when modal is open
watch(() => props.modelValue, (isOpen) => {
  if (process.client) {
    document.body.style.overflow = isOpen ? 'hidden' : ''
  }
})

</script>

<template>

  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
  >
    <!-- Backdrop -->
    <div
      class="absolute inset-0 bg-black/50 transition-opacity"
      @click="closeOnBackdrop && $emit('update:modelValue', false)"
    />
    
    <!-- Modal Content -->
    <div
      class="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-h-[90vh] overflow-hidden"
      :class="widthClass"
    >
      <slot />
    </div>
  </div>

</template>