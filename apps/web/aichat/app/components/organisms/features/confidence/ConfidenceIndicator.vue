<script setup lang="ts">

import type { ConfidenceIndicator, ConfidenceSettings } from '~/shared/types/confidence'

const props = defineProps<{
  indicator: ConfidenceIndicator | null
  settings: ConfidenceSettings
}>()
const emit = defineEmits<{
  updateSettings: [settings: Partial<ConfidenceSettings>]
  explain: [messageId: string]
}>()
const isExpanded = ref(false)
const confidenceLevel = computed(() => {
  if (!props.indicator) return null
  const { level } = props.indicator
  return {
    color: level === 'high' ? 'text-green-500' : level === 'medium' ? 'text-yellow-500' : level === 'low' ? 'text-orange-500' : 'text-red-500',
    bg: level === 'high' ? 'bg-green-500' : level === 'medium' ? 'bg-yellow-500' : level === 'low' ? 'bg-orange-500' : 'bg-red-500',
    label: level.charAt(0).toUpperCase() + level.slice(1),
  }
})
const confidenceScore = computed(() => {
  if (!props.indicator) return 0
  return Math.round(props.indicator.score * 100)
})

</script>

<template>

  <div class="confidence-indicator">
    <button
      v-if="settings.enabled && indicator"
      class="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs"
      :class="confidenceLevel?.bg + '/20'"
      @click="isExpanded = !isExpanded"
    >
      <div class="w-2 h-2 rounded-full" :class="confidenceLevel?.bg"></div>
      <span v-if="settings.showScore" :class="confidenceLevel?.color">{{ confidenceScore }}%</span>
      <span :class="confidenceLevel?.color">{{ confidenceLevel?.label }}</span>
    </button>
    
    <UModal v-model="isExpanded" :ui="{ width: 'max-w-sm' }">
      <UCard v-if="indicator">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold">Confidence Analysis</h3>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full" :class="confidenceLevel?.bg"></div>
              <span class="font-medium" :class="confidenceLevel?.color">{{ confidenceLevel?.label }}</span>
            </div>
          </div>
        
</template>