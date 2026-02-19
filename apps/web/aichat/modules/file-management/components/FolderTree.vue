<script setup lang="ts">

import type { Folder, FolderWithChildren } from '~/shared/types/folder'

const props = defineProps<{
  folders: FolderWithChildren[]
  selectedFolderId?: string
}>()
const emit = defineEmits<{
  select: [folderId: string]
  create: [parentId?: string]
  edit: [folder: Folder]
  delete: [folderId: string]
  move: [folderId: string, targetParentId: string | null]
}>()
const expandedFolders = ref<Set<string>>(new Set())
const dragFolderId = ref<string | null>(null)
function toggleExpand(folderId: string) {
  if (expandedFolders.value.has(folderId)) {
    expandedFolders.value.delete(folderId)
  } else {
    expandedFolders.value.add(folderId)
  }
}
function getFolderColor(color?: string) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
    gray: 'bg-gray-500',
  }
  return colors[color || ''] || 'bg-primary-500'
}

</script>

<template>

  <div class="folder-tree space-y-1">
    <div
      v-for="folder in folders"
      :key="folder.id"
      class="folder-item"
    >
      <div
        class="flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        :class="{ 'bg-primary-50 dark:bg-primary-900/20': selectedFolderId === folder.id }"
        @click="emit('select', folder.id)"
      >
        <button
          v-if="folder.children.length > 0"
          class="btn-icon text-xs"
          @click.stop="toggleExpand(folder.id)"
        >
          <span :class="expandedFolders.has(folder.id) ? 'i-carbon-chevron-down' : 'i-carbon-chevron-right'"></span>
        </button>
        <span v-else class="w-6"></span>
        
        <div class="w-3 h-3 rounded-full" :class="getFolderColor(folder.color)"></div>
        <span class="i-carbon-folder flex-shrink-0"></span>
        
        <span class="flex-1 truncate text-sm">{{ folder.name }}</span>
        <span class="text-xs text-gray-500">({{ folder.sessionCount }})</span>
        
        <div class="folder-actions opacity-0 group-hover:opacity-100 flex gap-1">
          <button class="btn-icon text-xs" @click.stop="emit('create', folder.id)" title="New subfolder">
            <span class="i-carbon-add"></span>
          </button>
          <button class="btn-icon text-xs" @click.stop="emit('edit', folder)" title="Edit">
            <span class="i-carbon-edit"></span>
          </button>
        </div>
      </div>
      
      <div
        v-if="expandedFolders.has(folder.id) && folder.children.length > 0"
        class="ml-4 pl-4 border-l border-gray-200 dark:border-gray-700"
      >
        <FolderTree
          :folders="folder.children"
          :selected-folder-id="selectedFolderId"
          @select="emit('select', $event)"
          @create="emit('create', $event)"
          @edit="emit('edit', $event)"
          @delete="emit('delete', $event)"
          @move="emit('move', $event)"
        />
      </div>
    </div>
  </div>

</template>