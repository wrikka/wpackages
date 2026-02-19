<script setup lang="ts">

import type { Folder } from '#shared/types/folder';
import { useFolderShareStore } from '~/stores/folderShare';
import { useFolderItem } from '~/composables/chat/useFolderItem';

const props = defineProps<{ folder: Folder }>();
const foldersStore = useKnowledgeBasesStore();
const folderShareStore = useFolderShareStore();
// Use folder item composable
const {
  isEditing,
  newName,
  isConfirmModalOpen,
  startEditing,
  saveName: saveFolderName,
  confirmDelete: confirmFolderDelete,
} = useFolderItem(props.folder)
// Wrapper functions that include the store
const saveName = () => saveFolderName(foldersStore)
const confirmDelete = () => confirmFolderDelete(foldersStore)

</script>

<template>

  <div>
    <div class="p-2 font-bold bg-gray-100 flex justify-between items-center group">
      <div v-if="!isEditing" class="flex-1 truncate" @dblclick="startEditing">
        {{ folder.name }}
      </div>
      <input
        v-else
        v-model="newName"
        type="text"
        class="input-sm flex-1"
        @blur="saveName"
        @keyup.enter="saveName"
        @keyup.esc="isEditing = false"
      />
      <div class="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button class="btn-icon-sm" @click="startEditing">
          <span class="i-carbon-edit"></span>
        </button>
        <button class="btn-icon-sm" @click="folderShareStore.openShareModal(folder)">
          <span class="i-carbon-share"></span>
        </button>
        <button class="btn-icon-sm text-red-500" @click="isConfirmModalOpen = true">
          <span class="i-carbon-trash-can"></span>
        </button>
      </div>
    </div>

    <UModal v-model="isConfirmModalOpen">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Delete Folder</h3>
        
</template>