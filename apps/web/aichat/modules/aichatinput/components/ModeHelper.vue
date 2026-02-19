<script setup lang="ts">
interface Props {
  isOpen: boolean
  modeConfig: any
  modeUx: any
  onClose: () => void
}

defineProps<Props>()
</script>

<template>
  <div v-if="isOpen && modeConfig" class="mode-helper p-3 bg-gray-50 dark:bg-gray-800 border-b">
    <div class="flex items-start gap-2">
      <UIcon :name="modeUx.icon" class="w-5 h-5 mt-0.5" />
      <div class="flex-1">
        <div class="font-medium">{{ modeConfig.name }}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">{{ modeUx.hint }}</div>
      </div>
      <UButton size="xs" color="gray" variant="ghost" @click="onClose">
        <UIcon name="i-heroicons-x-mark-20-solid" />
      </UButton>
    </div>
  </div>
</template>
