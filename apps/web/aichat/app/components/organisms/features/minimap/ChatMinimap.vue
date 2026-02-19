<script setup lang="ts">

import type { ChatMinimap, MinimapMessage } from '~/shared/types/minimap'

const props = defineProps<{
  minimap: ChatMinimap
  totalMessages: number
}>()
const emit = defineEmits<{
  navigateToMessage: [messageId: string]
  toggleMinimap: []
}>()
const minimapRef = ref<HTMLElement>()
const isDragging = ref(false)
const viewportStyle = computed(() => {
  const { viewport } = props.minimap
  return {
    top: `${viewport.top}%`,
    height: `${viewport.height}%`,
  }
})
function handleMinimapClick(e: MouseEvent) {
  const rect = minimapRef.value?.getBoundingClientRect()
  if (!rect) return
  const y = (e.clientY - rect.top) / rect.height
  const messageIndex = Math.floor(y * props.totalMessages)
  const message = props.minimap.messages[messageIndex]
  if (message) {
    emit('navigateToMessage', message.id)
  }
}
function getMessageStyle(message: MinimapMessage) {
  return {
    top: `${message.y}%`,
    height: `${message.height}%`,
    backgroundColor: message.color,
  }
}

</script>

<template>

  <div class="chat-minimap">
    <button
      class="btn-icon fixed right-4 bottom-4 z-30"
      :class="minimap.isOpen ? 'text-primary-500' : ''"
      @click="emit('toggleMinimap')"
    >
      <span class="i-carbon-minimap"></span>
    </button>
    
    <div
      v-if="minimap.isOpen"
      ref="minimapRef"
      class="fixed right-4 top-20 bottom-20 w-16 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 z-30 overflow-hidden cursor-pointer"
      @click="handleMinimapClick"
    >
      <div
        v-for="message in minimap.messages"
        :key="message.id"
        class="absolute w-full rounded-sm cursor-pointer hover:opacity-80"
        :class="message.role === 'user' ? 'bg-blue-400' : 'bg-green-400'"
        :style="getMessageStyle(message)"
        @click.stop="emit('navigateToMessage', message.id)"
      ></div>
      
      <div
        v-for="highlight in minimap.highlights"
        :key="highlight.messageId"
        class="absolute w-full h-0.5"
        :style="{ top: `${minimap.messages.find(m => m.id === highlight.messageId)?.y}%`, backgroundColor: highlight.color }"
      ></div>
      
      <div
        class="absolute w-full bg-white/50 dark:bg-black/50 border-y border-primary-500 cursor-move"
        :style="viewportStyle"
      ></div>
    </div>
  </div>

</template>