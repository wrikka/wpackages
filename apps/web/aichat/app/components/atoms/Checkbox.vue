<script setup lang="ts">


interface Props {
  modelValue?: boolean | string[]
  value?: string
  label?: string
  disabled?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})
const emit = defineEmits<{
  'update:modelValue': [value: boolean | string[]]
}>()
const handleChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (Array.isArray(props.modelValue)) {
    const newValue = [...props.modelValue]
    if (target.checked) {
      newValue.push(props.value || '')
    } else {
      const index = newValue.indexOf(props.value || '')
      if (index > -1) newValue.splice(index, 1)
    }
    emit('update:modelValue', newValue)
  } else {
    emit('update:modelValue', target.checked)
  }
}

</script>

<template>

  <label class="inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      :checked="modelValue"
      :value="value"
      :disabled="disabled"
      class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
      @change="handleChange"
    >
    <span v-if="label" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">{{ label }}</span>
  </label>

</template>