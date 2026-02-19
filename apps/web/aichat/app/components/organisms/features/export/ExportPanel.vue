<script setup lang="ts">

import type { ExportOptions, ExportPreset } from '~/shared/types/export'

const props = defineProps<{
  presets: ExportPreset[]
  isExporting: boolean
}>()
const emit = defineEmits<{
  export: [options: ExportOptions]
  savePreset: [name: string, options: ExportOptions]
  deletePreset: [presetId: string]
}>()
const isOpen = ref(false)
const selectedFormat = ref<ExportOptions['format']>('markdown')
const includeMetadata = ref(true)
const includeTimestamps = ref(true)
const includeModelInfo = ref(true)
const includeTokenUsage = ref(false)
const presetName = ref('')
const showSavePreset = ref(false)
const formats = [
  { id: 'pdf', label: 'PDF', icon: 'i-carbon-document-pdf' },
  { id: 'markdown', label: 'Markdown', icon: 'i-carbon-markdown' },
  { id: 'json', label: 'JSON', icon: 'i-carbon-json' },
  { id: 'txt', label: 'Plain Text', icon: 'i-carbon-document' },
  { id: 'html', label: 'HTML', icon: 'i-carbon-html' },
]
function executeExport() {
  emit('export', {
    format: selectedFormat.value,
    includeMetadata: includeMetadata.value,
    includeTimestamps: includeTimestamps.value,
    includeModelInfo: includeModelInfo.value,
    includeTokenUsage: includeTokenUsage.value,
  })
  isOpen.value = false
}
function saveAsPreset() {
  if (!presetName.value) return
  emit('savePreset', presetName.value, {
    format: selectedFormat.value,
    includeMetadata: includeMetadata.value,
    includeTimestamps: includeTimestamps.value,
    includeModelInfo: includeModelInfo.value,
    includeTokenUsage: includeTokenUsage.value,
  })
  showSavePreset.value = false
  presetName.value = ''
}
function loadPreset(preset: ExportPreset) {
  selectedFormat.value = preset.options.format
  includeMetadata.value = preset.options.includeMetadata
  includeTimestamps.value = preset.options.includeTimestamps
  includeModelInfo.value = preset.options.includeModelInfo
  includeTokenUsage.value = preset.options.includeTokenUsage
}

</script>

<template>

  <div>
    <button class="btn-secondary" @click="isOpen = true">
      <span class="i-carbon-export"></span>
      Export
    </button>
    
    <UModal v-model="isOpen">
      <UCard>
        <template #header>
          <h3 class="font-semibold">Export Conversation</h3>
        
</template>