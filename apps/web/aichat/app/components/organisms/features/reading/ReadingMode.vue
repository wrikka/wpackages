<script setup lang="ts">

import type { ReadingMode, ReadingModeSettings } from '~/shared/types/readingMode'

const props = defineProps<{
  mode: ReadingMode
  settings: ReadingModeSettings
}>()
const emit = defineEmits<{
  toggle: []
  updateMode: [mode: Partial<ReadingMode>]
  updateSettings: [settings: Partial<ReadingModeSettings>]
  nextMessage: []
  prevMessage: []
}>()
const isOpen = ref(false)
const fontSizeOptions = [
  { value: 'small', label: 'Small', class: 'text-sm' },
  { value: 'medium', label: 'Medium', class: 'text-base' },
  { value: 'large', label: 'Large', class: 'text-lg' },
]
const lineHeightOptions = [
  { value: 'compact', label: 'Compact', valueNum: 1.4 },
  { value: 'normal', label: 'Normal', valueNum: 1.6 },
  { value: 'relaxed', label: 'Relaxed', valueNum: 1.8 },
]
const widthOptions = [
  { value: 'narrow', label: 'Narrow', class: 'max-w-2xl' },
  { value: 'medium', label: 'Medium', class: 'max-w-4xl' },
  { value: 'wide', label: 'Wide', class: 'max-w-6xl' },
]
const themeOptions = [
  { value: 'light', label: 'Light', bg: 'bg-white', text: 'text-gray-900' },
  { value: 'dark', label: 'Dark', bg: 'bg-gray-900', text: 'text-gray-100' },
  { value: 'sepia', label: 'Sepia', bg: 'bg-amber-50', text: 'text-amber-900' },
]

</script>

<template>

  <div class="reading-mode">
    <button
      class="btn-icon"
      :class="mode.isActive ? 'text-primary-500' : ''"
      title="Reading mode"
      @click="mode.isActive ? emit('toggle') : isOpen = true"
    >
      <span :class="mode.isActive ? 'i-carbon-view-filled' : 'i-carbon-view'"></span>
    </button>
    
    <UModal v-model="isOpen">
      <UCard>
        <template #header>
          <h3 class="font-semibold">Reading Mode Settings</h3>
        
</template>