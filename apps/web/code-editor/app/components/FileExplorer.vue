<script setup>

import { reactive, onMounted, onUnmounted } from 'vue'
import FileTreeItem from './FileTreeItem.vue'
import ContextMenu from './ContextMenu.vue'
import Modal from './Modal.vue'

const emit = defineEmits(['file-selected'])

const { data: fileTree, pending, error, refresh } = await useFetch('/api/files')

const contextMenu = reactive({ show: false, x: 0, y: 0, items: [] })
const modalState = reactive({ show: false, title: '', message: '', type: 'alert', onConfirm: () => {}, onCancel: () => {} })

// --- Modal Promise Wrappers ---
function showPrompt({ title, initialValue = '' }) {
  return new Promise((resolve, reject) => {
    Object.assign(modalState, {
      show: true, type: 'prompt', title, initialValue,
      onConfirm: (value) => { modalState.show = false; resolve(value); },
      onCancel: () => { modalState.show = false; reject(new Error('Cancelled')); }
    })
  })
}

function showConfirm({ title, message, confirmClass = 'bg-red-500 hover:bg-red-600', confirmText = 'Delete' }) {
  return new Promise((resolve, reject) => {
    Object.assign(modalState, {
      show: true, type: 'confirm', title, message, confirmClass, confirmText,
      onConfirm: () => { modalState.show = false; resolve(true); },
      onCancel: () => { modalState.show = false; reject(new Error('Cancelled')); }
    })
  })
}

// --- Context Menu ---
function showContextMenu({ event, item }) {
  contextMenu.show = true
  contextMenu.x = event.clientX
  contextMenu.y = event.clientY
  contextMenu.items = [
    { label: 'Rename', action: () => { handleRenameItem(item); closeContextMenu(); } },
    { label: 'Delete', action: () => { handleDeleteItem(item); closeContextMenu(); } },
  ]
}
function closeContextMenu() { contextMenu.show = false }
onMounted(() => window.addEventListener('click', closeContextMenu))
onUnmounted(() => window.removeEventListener('click', closeContextMenu))

// --- File Operations ---
function onFileClick(file) { emit('file-selected', file) }

async function promptCreate(type) {
  try {
    const name = await showPrompt({ title: `Enter the name for the new ${type}:` })
    if (!name) return
    await $fetch('/api/files/create', { method: 'POST', body: { path: name, type } })
    refresh()
  } catch (err) { /* Cancelled */ }
}

async function handleDeleteItem(item) {
  try {
    await showConfirm({ title: 'Delete Item', message: `Are you sure you want to delete '${item.name}'?` })
    await $fetch('/api/files/delete', { method: 'POST', body: { path: item.path } })
    refresh()
  } catch (err) { /* Cancelled */ }
}

async function handleRenameItem(item) {
  try {
    const newName = await showPrompt({ title: `Enter the new name for '${item.name}':`, initialValue: item.name })
    if (!newName || newName === item.name) return
    const oldPath = item.path
    const newPath = oldPath.substring(0, oldPath.lastIndexOf('/') + 1) + newName
    await $fetch('/api/files/rename', { method: 'POST', body: { oldPath, newPath } })
    refresh()
  } catch (err) { /* Cancelled */ }
}

</script>

<template>

  <div class="p-2 h-full overflow-auto flex flex-col" @click="closeContextMenu">
    <div class="flex justify-between items-center mb-2">
      <h2 class="text-lg font-bold">Explorer</h2>
      <div class="space-x-1">
        <button @click="promptCreate('file')" title="New File" class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">📄</button>
        <button @click="promptCreate('folder')" title="New Folder" class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">📁</button>
      </div>
    </div>
    <div v-if="pending" class="flex-1 flex items-center justify-center">Loading files...</div>
    <div v-else-if="error" class="text-red-500">Failed to load file tree.</div>
    <div v-else class="flex-1 overflow-auto">
      <FileTreeItem 
        v-for="(item, index) in fileTree" 
        :key="index" 
        :item="item"
        @file-click="onFileClick"
        @delete-item="handleDeleteItem"
        @rename-item="handleRenameItem"
        @context-menu="showContextMenu"
      />
    </div>
    <ContextMenu 
      :show="contextMenu.show"
      :x="contextMenu.x"
      :y="contextMenu.y"
      :items="contextMenu.items"
    />
    <Modal v-bind="modalState" @confirm="modalState.onConfirm" @cancel="modalState.onCancel" />
  </div>

</template>