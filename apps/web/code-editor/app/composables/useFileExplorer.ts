import { ref, computed } from 'vue'
import type { FileItem, FileOperation, FileContextMenu } from '@shared/types'

export const useFileExplorer = () => {
  const files = ref<FileItem[]>([])
  const selectedFile = ref<FileItem | null>(null)
  const contextMenu = ref<FileContextMenu>({
    show: false,
    x: 0,
    y: 0,
    items: []
  })
  const loading = ref(false)
  const error = ref<string | null>(null)

  const currentPath = ref('/')
  const breadcrumb = computed(() => {
    return currentPath.value.split('/').filter(Boolean)
  })

  const fetchFiles = async (path: string = '/') => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<FileItem[]>(`/api/files?path=${encodeURIComponent(path)}`)
      files.value = response || []
      currentPath.value = path
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch files'
    } finally {
      loading.value = false
    }
  }

  const createFile = async (name: string, type: 'file' | 'directory' = 'file') => {
    const operation: FileOperation = {
      type: 'create',
      name,
      destination: currentPath.value
    }

    try {
      await $fetch('/api/files', {
        method: 'POST',
        body: operation
      })
      await fetchFiles(currentPath.value)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create file'
    }
  }

  const deleteFile = async (path: string) => {
    try {
      await $fetch(`/api/files/${encodeURIComponent(path)}`, {
        method: 'DELETE'
      })
      await fetchFiles(currentPath.value)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete file'
    }
  }

  const renameFile = async (oldPath: string, newName: string) => {
    const operation: FileOperation = {
      type: 'rename',
      source: oldPath,
      name: newName
    }

    try {
      await $fetch('/api/files/rename', {
        method: 'POST',
        body: operation
      })
      await fetchFiles(currentPath.value)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to rename file'
    }
  }

  const showContextMenu = (event: MouseEvent, items: any[]) => {
    contextMenu.value = {
      show: true,
      x: event.clientX,
      y: event.clientY,
      items
    }
  }

  const hideContextMenu = () => {
    contextMenu.value.show = false
  }

  const navigateToPath = (path: string) => {
    currentPath.value = path
    fetchFiles(path)
  }

  return {
    files,
    selectedFile,
    contextMenu,
    loading,
    error,
    currentPath,
    breadcrumb,
    fetchFiles,
    createFile,
    deleteFile,
    renameFile,
    showContextMenu,
    hideContextMenu,
    navigateToPath
  }
}
