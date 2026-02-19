<script setup lang="ts">


defineProps<{
  icon: string
  tooltip?: string
  isActive?: boolean
  disabled?: boolean
}>()
defineEmits<{
  click: []
}>()

</script>

<template>

  <button
    class="p-2 rounded-lg transition-colors relative group"
    :class="[
      isActive 
        ? 'bg-red-100 dark:bg-red-900 text-red-500 animate-pulse' 
        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700',
      disabled ? 'opacity-50 cursor-not-allowed' : ''
    ]"
    :disabled="disabled"
    :title="tooltip"
    @click="$emit('click')"
  >
    <Icon :name="icon" class="w-5 h-5" />
    <span 
      v-if="tooltip"
      class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
    >
      {{ tooltip }}
    </span>
  </button>

</template>