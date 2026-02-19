<script setup>

import { ref, computed } from 'vue'

const props = defineProps({
  item: Object
})

const emit = defineEmits(['file-click', 'delete-item', 'rename-item', 'context-menu'])

const isOpen = ref(false)

const isFolder = computed(() => props.item.type === 'folder' && props.item.children)

function toggle() {
  if (isFolder.value) {
    isOpen.value = !isOpen.value
  } else {
    emit('file-click', props.item)
  }
}

function emitFileClick(file) {
  emit('file-click', file)
}

function emitDeleteItem() {
  emit('delete-item', props.item)
}

function emitChildDeleteItem(item) {
  emit('delete-item', item)
}

function emitRenameItem() {
  emit('rename-item', props.item)
}

function emitChildRenameItem(item) {
  emit('rename-item', item)
}

function emitContextMenu(event) {
  emit('context-menu', { event, item: props.item })
}

function emitChildContextMenu(payload) {
  emit('context-menu', payload)
}

</script>

<template>

  <div>
    <div 
      @contextmenu.prevent="emitContextMenu($event)"
      class="flex items-center justify-between p-1 rounded group hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      <div @click="toggle" class="flex items-center cursor-pointer flex-1">
        <span class="w-4 mr-1">
          <template v-if="isFolder">
            {{ isOpen ? '▼' : '►' }}
          
</template>