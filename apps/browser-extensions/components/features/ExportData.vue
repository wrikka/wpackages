<script setup lang="ts">

import { ref } from 'vue'
import { useExportData } from '@/composables/useExportData'
import { Download, FileJson, FileText, FileSpreadsheet, Check } from 'lucide-vue-next'
import Button from '@/components/ui/button.vue'

const { isExporting, lastExport, exportData } = useExportData()

const selectedFormat = ref<'json' | 'markdown' | 'csv' | 'txt'>('json')
const selectedTypes = ref<string[]>(['all'])
const includeMetadata = ref(true)
const exportSuccess = ref(false)

const formatOptions = [
  { value: 'json', label: 'JSON', icon: FileJson, desc: 'Machine readable' },
  { value: 'markdown', label: 'Markdown', icon: FileText, desc: 'Human readable' },
  { value: 'csv', label: 'CSV', icon: FileSpreadsheet, desc: 'Spreadsheet format' },
  { value: 'txt', label: 'Plain Text', icon: FileText, desc: 'Simple text' },
]

const dataTypeOptions = [
  { value: 'all', label: 'Everything' },
  { value: 'bookmarks', label: 'Bookmarks' },
  { value: 'notes', label: 'Notes' },
  { value: 'chat', label: 'Chat History' },
  { value: 'prompts', label: 'Custom Prompts' },
  { value: 'mood', label: 'Mood Entries' },
  { value: 'history', label: 'Session History' },
]

const handleExport = async () => {
  exportSuccess.value = false
  const success = await exportData({
    format: selectedFormat.value,
    dataTypes: selectedTypes.value as ('all' | 'bookmarks' | 'notes' | 'chat' | 'prompts' | 'mood' | 'history')[],
    includeMetadata: includeMetadata.value,
  })
  if (success) {
    exportSuccess.value = true
    setTimeout(() => exportSuccess.value = false, 3000)
  }
}

const toggleDataType = (type: string) => {
  if (type === 'all') {
    selectedTypes.value = ['all']
  } else {
    selectedTypes.value = selectedTypes.value.filter(t => t !== 'all')
    if (selectedTypes.value.includes(type)) {
      selectedTypes.value = selectedTypes.value.filter(t => t !== type)
    } else {
      selectedTypes.value.push(type)
    }
    if (selectedTypes.value.length === 0) {
      selectedTypes.value = ['all']
    }
  }
}

</script>

<template>

  <div class="p-4 space-y-4">
    <div class="flex items-center gap-2 mb-4">
      <Download class="h-5 w-5 text-primary" />
      <h3 class="font-semibold">Export Your Data</h3>
    </div>

    <!-- Format Selection -->
    <div class="space-y-2">
      <label class="text-sm font-medium">Export Format</label>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="fmt in formatOptions"
          :key="fmt.value"
          :class="[
            'flex items-center gap-2 p-3 rounded-lg border text-left transition-all',
            selectedFormat === fmt.value
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          ]"
          @click="selectedFormat = fmt.value"
        >
          <component :is="fmt.icon" class="h-4 w-4" />
          <div>
            <div class="text-sm font-medium">{{ fmt.label }}</div>
            <div class="text-xs text-muted-foreground">{{ fmt.desc }}</div>
          </div>
        </button>
      </div>
    </div>

    <!-- Data Types -->
    <div class="space-y-2">
      <label class="text-sm font-medium">Data to Export</label>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="type in dataTypeOptions"
          :key="type.value"
          :class="[
            'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
            selectedTypes.includes(type.value)
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          ]"
          @click="toggleDataType(type.value)"
        >
          {{ type.label }}
        </button>
      </div>
    </div>

    <!-- Options -->
    <div class="flex items-center gap-2">
      <input
        id="metadata"
        v-model="includeMetadata"
        type="checkbox"
        class="rounded border-input"
      />
      <label for="metadata" class="text-sm">Include export metadata</label>
    </div>

    <!-- Export Button -->
    <Button
      variant="default"
      class="w-full btn-primary"
      :disabled="isExporting || selectedTypes.length === 0"
      @click="handleExport"
    >
      <Download v-if="!isExporting && !exportSuccess" class="h-4 w-4 mr-2" />
      <Check v-else-if="exportSuccess" class="h-4 w-4 mr-2" />
      <span v-else class="mr-2">⏳</span>
      {{ isExporting ? 'Exporting...' : exportSuccess ? 'Exported!' : 'Export Data' }}
    </Button>

    <p v-if="lastExport" class="text-xs text-muted-foreground text-center">
      Last export: {{ lastExport }}
    </p>
  </div>

</template>