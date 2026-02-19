export interface FileItem {
  id: string
  name: string
  type: 'file' | 'directory'
  path: string
  size?: number
  modified?: string
  children?: FileItem[]
}

export interface FileOperation {
  type: 'create' | 'delete' | 'rename' | 'move'
  source?: string
  destination?: string
  name?: string
}

export interface FileContextMenu {
  show: boolean
  x: number
  y: number
  items: ContextMenuItem[]
}

export interface ContextMenuItem {
  label: string
  action: string
  icon?: string
  disabled?: boolean
}
