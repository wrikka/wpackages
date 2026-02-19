import type { FileItem } from '~/shared/types'

export const getFileIcon = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase()
  const iconMap: Record<string, string> = {
    'ts': 'i-heroicons-code-bracket',
    'js': 'i-heroicons-code-bracket',
    'vue': 'i-simple-icons-vuedotjs',
    'md': 'i-heroicons-document-text',
    'json': 'i-heroicons-document-duplicate',
    'css': 'i-heroicons-paint-brush',
    'html': 'i-heroicons-globe-alt',
    'png': 'i-heroicons-photo',
    'jpg': 'i-heroicons-photo',
    'jpeg': 'i-heroicons-photo',
    'svg': 'i-heroicons-photo',
    'pdf': 'i-heroicons-document',
  }
  return iconMap[ext || ''] || 'i-heroicons-document'
}

export const getFileLanguage = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase()
  const langMap: Record<string, string> = {
    'ts': 'typescript',
    'js': 'javascript',
    'vue': 'vue',
    'md': 'markdown',
    'json': 'json',
    'css': 'css',
    'html': 'html',
    'py': 'python',
    'go': 'go',
    'rs': 'rust',
  }
  return langMap[ext || ''] || 'plaintext'
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
