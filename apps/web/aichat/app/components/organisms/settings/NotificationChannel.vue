<script setup lang="ts">


const modelValue = defineModel<boolean>({ required: true })
defineProps<{
  icon: string
  title: string
  description: string
}>()
defineEmits<{
  change: []
}>()

</script>

<template>

  <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
    <div class="flex items-center gap-3">
      <Icon :name="icon" class="w-6 h-6 text-blue-500" />
      <div>
        <p class="font-medium">{{ title }}</p>
        <p class="text-xs text-gray-500">{{ description }}</p>
      </div>
    </div>
    <Toggle v-model="modelValue" @change="$emit('change')" />
    <slot />
  </div>

</template>