<script setup lang="ts">

import type { CanvasNode, CanvasEdge, WhiteboardSession } from '~/shared/types/canvas'

const props = defineProps<{
  session: WhiteboardSession | null
}>()
const emit = defineEmits<{
  nodeMove: [nodeId: string, x: number, y: number]
  nodeSelect: [nodeId: string]
  nodeCreate: [type: CanvasNode['type'], x: number, y: number]
  edgeCreate: [sourceId: string, targetId: string]
}>()
const canvasRef = ref<HTMLElement>()
const scale = ref(1)
const offset = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const dragNode = ref<string | null>(null)
const selectedTool = ref<'select' | 'text' | 'sticky' | 'connect'>('select')
const tools = [
  { id: 'select', icon: 'i-carbon-cursor-1', label: 'Select' },
  { id: 'text', icon: 'i-carbon-text', label: 'Text' },
  { id: 'sticky', icon: 'i-carbon-note', label: 'Sticky' },
  { id: 'connect', icon: 'i-carbon-connect', label: 'Connect' },
]
function handleCanvasClick(e: MouseEvent) {
  if (selectedTool.value === 'text' || selectedTool.value === 'sticky') {
    const rect = canvasRef.value?.getBoundingClientRect()
    if (!rect) return
    const x = (e.clientX - rect.left - offset.value.x) / scale.value
    const y = (e.clientY - rect.top - offset.value.y) / scale.value
    emit('nodeCreate', selectedTool.value, x, y)
    selectedTool.value = 'select'
  }
}

</script>

<template>

  <div class="canvas-editor flex flex-col h-full">
    <div class="canvas-toolbar flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-700">
      <button
        v-for="tool in tools"
        :key="tool.id"
        class="btn-icon"
        :class="selectedTool === tool.id ? 'bg-primary-100 dark:bg-primary-900 text-primary-600' : ''"
        :title="tool.label"
        @click="selectedTool = tool.id as any"
      >
        <span :class="tool.icon"></span>
      </button>
      
      <div class="divider w-px h-6 bg-gray-300 mx-2"></div>
      
      <button class="btn-icon" title="Zoom out" @click="scale = Math.max(0.25, scale - 0.25)">
        <span class="i-carbon-zoom-out"></span>
      </button>
      <span class="text-sm w-12 text-center">{{ (scale * 100).toFixed(0) }}%</span>
      <button class="btn-icon" title="Zoom in" @click="scale = Math.min(3, scale + 0.25)">
        <span class="i-carbon-zoom-in"></span>
      </button>
    </div>
    
    <div
      ref="canvasRef"
      class="canvas-viewport flex-1 relative overflow-hidden bg-gray-50 dark:bg-gray-900 cursor-grab"
      :class="{ 'cursor-grabbing': isDragging }"
      @click="handleCanvasClick"
    >
      <div
        class="canvas-content absolute"
        :style="{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: '0 0',
        }"
      >
        <div
          v-for="node in session?.nodes"
          :key="node.id"
          class="canvas-node absolute p-3 rounded-lg shadow-md cursor-move"
          :class="{
            'bg-white dark:bg-gray-800': node.type === 'text',
            'bg-yellow-100 dark:bg-yellow-900': node.type === 'sticky',
            'bg-blue-50 dark:bg-blue-900': node.type === 'code',
            'ring-2 ring-primary-500': dragNode === node.id,
          }"
          :style="{ left: `${node.x}px`, top: `${node.y}px`, width: `${node.width}px` }"
        >
          <p class="text-sm whitespace-pre-wrap">{{ node.content }}</p>
        </div>
      </div>
    </div>
  </div>

</template>