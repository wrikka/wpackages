// File management types

export interface FileItem {
  id: string
  name: string
  type: string
  size: number
  url?: string
  uploadedAt: Date
  metadata?: Record<string, any>
  mimeType?: string
  path?: string
}

export interface Folder {
  id: string
  name: string
  parentId?: string
  files: FileItem[]
  folders: Folder[]
  createdAt: Date
  updatedAt: Date
  shared?: boolean
  permissions?: {
    canRead: boolean
    canWrite: boolean
    canDelete: boolean
    canShare: boolean
  }
}

export interface FileUploadProgress {
  fileId: string
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error' | 'paused'
  error?: string
  speed?: number
  estimatedTime?: number
}

export interface FileShare {
  id: string
  fileId: string
  folderId?: string
  shareToken: string
  expiresAt?: Date
  permissions: {
    canView: boolean
    canDownload: boolean
    canUpload: boolean
    canDelete: boolean
  }
  createdBy: string
  createdAt: Date
}

export interface VaultItem {
  id: string
  name: string
  type: 'file' | 'folder'
  encrypted: boolean
  size?: number
  path?: string
  parentId?: string
  createdAt: Date
  updatedAt: Date
  tags?: string[]
  metadata?: Record<string, any>
}

export interface FileSearchResult {
  item: FileItem | Folder
  score: number
  matches: Array<{
    field: string
    value: string
    highlights: Array<{
      start: number
      end: number
    }>
  }>
}

export interface FileOperation {
  id: string
  type: 'copy' | 'move' | 'delete' | 'rename' | 'upload' | 'download'
  source: string
  destination?: string
  status: 'pending' | 'in_progress' | 'completed' | 'error'
  progress: number
  error?: string
  createdAt: Date
  completedAt?: Date
}
