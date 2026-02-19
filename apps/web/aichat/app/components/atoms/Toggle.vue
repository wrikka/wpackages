<script setup lang="ts">


interface Props {
  modelValue?: boolean
  label?: string
  disabled?: boolean
}
withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false,
})
defineEmits<{
  'update:modelValue': [value: boolean]
}>()

</script>

<template>

  <label class="inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      class="sr-only peer"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    >
    <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed" />
    <span v-if="label" class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">{{ label }}</span>
  </label>

</template>