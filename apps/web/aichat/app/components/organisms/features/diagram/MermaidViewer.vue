<script setup lang="ts">

import type { MermaidDiagram } from '~/shared/types/diagram'

const props = defineProps<{
  diagram: MermaidDiagram
}>()
const emit = defineEmits<{
  rerender: [diagramId: string]
  zoomIn: []
  zoomOut: []
  download: [format: 'svg' | 'png']
}>()
const zoom = ref(1)
const isDark = ref(false)
const showCode = ref(false)
const zoomPercent = computed(() => `${Math.round(zoom.value * 100)}%`)
function handleZoomIn() {
  zoom.value = Math.min(zoom.value + 0.2, 3)
  emit('zoomIn')
}
function handleZoomOut() {
  zoom.value = Math.max(zoom.value - 0.2, 0.5)
  emit('zoomOut')
}

</script>

<template>

  <div class="mermaid-viewer border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
    <div class="viewer-toolbar flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 border-b">
      <div class="flex items-center gap-2">
        <span class="badge text-xs">{{ diagram.type }}</span>
        <button class="btn-icon text-xs" @click="showCode = !showCode">
          <span :class="showCode ? 'i-carbon-code' : 'i-carbon-code-hide'"></span>
        </button>
      </div>
      
      <div class="flex items-center gap-1">
        <button class="btn-icon text-xs" @click="handleZoomOut">
          <span class="i-carbon-zoom-out"></span>
        </button>
        <span class="text-xs w-12 text-center">{{ zoomPercent }}</span>
        <button class="btn-icon text-xs" @click="handleZoomIn">
          <span class="i-carbon-zoom-in"></span>
        </button>
        <div class="divider w-px h-4 bg-gray-300 mx-1"></div>
        <button class="btn-icon text-xs" title="Toggle theme" @click="isDark = !isDark">
          <span :class="isDark ? 'i-carbon-moon' : 'i-carbon-sun'"></span>
        </button>
        <button class="btn-icon text-xs" title="Download SVG" @click="emit('download', 'svg')">
          <span class="i-carbon-download"></span>
        </button>
        <button class="btn-icon text-xs" title="Rerender" @click="emit('rerender', diagram.id)">
          <span class="i-carbon-rotate"></span>
        </button>
      </div>
    </div>
    
    <div v-if="showCode" class="diagram-code p-3 bg-gray-100 dark:bg-gray-900 border-b">
      <pre class="text-xs overflow-x-auto"><code>{{ diagram.definition }}</code></pre>
    </div>
    
    <div
      class="diagram-content p-4 overflow-auto flex items-center justify-center min-h-48"
      :class="isDark ? 'bg-gray-900' : 'bg-white'"
    >
      <div v-if="diagram.svg" v-html="diagram.svg" :style="{ transform: `scale(${zoom.value})` }"></div>
      <div v-else-if="diagram.error" class="text-red-500 text-sm">
        <span class="i-carbon-warning"></span>
        {{ diagram.error }}
      </div>
      <div v-else class="text-gray-500 text-sm">Rendering diagram...</div>
    </div>
  </div>

</template>