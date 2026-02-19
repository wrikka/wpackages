<script setup lang="ts">


interface ReorderItem {
  id: string
  title: string
  subtitle: string
  count: number
}
const items = ref<ReorderItem[]>([
  { id: '1', title: 'Work Chats', subtitle: '15 conversations', count: 15 },
  { id: '2', title: 'Personal', subtitle: '8 conversations', count: 8 },
  { id: '3', title: 'Projects', subtitle: '12 conversations', count: 12 },
  { id: '4', title: 'Archive', subtitle: '24 conversations', count: 24 }
])
const draggingId = ref<string | null>(null)
const dragIndex = ref<number>(-1)
const onDragStart = (e: DragEvent, item: ReorderItem, index: number) => {
  draggingId.value = item.id
  dragIndex.value = index
  e.dataTransfer?.setData('text/plain', item.id)
}
const onDragOver = (e: DragEvent, index: number) => {
  e.preventDefault()
  if (dragIndex.value === index) return
  // Reorder items
  const itemToMove = items.value[dragIndex.value]
  items.value.splice(dragIndex.value, 1)
  items.value.splice(index, 0, itemToMove)
  dragIndex.value = index
}
const onDrop = (e: DragEvent, index: number) => {
  e.preventDefault()
}
const onDragEnd = () => {
  draggingId.value = null
  dragIndex.value = -1
}

</script>

<template>

  <div class="drag-drop-reorder">
    <div class="reorder-list space-y-2">
      <div
        v-for="(item, index) in items"
        :key="item.id"
        class="reorder-item flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-move"
        :class="{ 'opacity-50': draggingId === item.id }"
        draggable="true"
        @dragstart="onDragStart($event, item, index)"
        @dragover.prevent="onDragOver($event, index)"
        @drop="onDrop($event, index)"
        @dragend="onDragEnd"
      >
        <UIcon name="i-heroicons-grip-vertical" class="text-gray-400" />
        <div class="flex-1">
          <p class="font-medium text-sm">{{ item.title }}</p>
          <p class="text-xs text-gray-500">{{ item.subtitle }}</p>
        </div>
        <UBadge size="xs" color="gray">{{ item.count }}</UBadge>
      </div>
    </div>
  </div>

</template>