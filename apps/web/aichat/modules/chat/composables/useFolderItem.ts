import { ref } from 'vue'
import type { Folder } from '#shared/types/folder'

export function useFolderItem(folder: Folder) {
  const isEditing = ref(false)
  const newName = ref(folder.name)
  const isConfirmModalOpen = ref(false)

  const startEditing = () => {
    newName.value = folder.name
    isEditing.value = true
  }

  const saveName = async (foldersStore: any) => {
    if (newName.value.trim() && newName.value.trim() !== folder.name) {
      await foldersStore.renameFolder(folder.id, newName.value.trim())
    }
    isEditing.value = false
  }

  const confirmDelete = async (foldersStore: any) => {
    await foldersStore.deleteFolder(folder.id)
    isConfirmModalOpen.value = false
  }

  return {
    isEditing,
    newName,
    isConfirmModalOpen,
    startEditing,
    saveName,
    confirmDelete,
  }
}
