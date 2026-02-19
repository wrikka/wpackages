export interface Shortcut {
  key: string
  description: string
  keys: string[]
}

export interface ShortcutCategory {
  name: string
  shortcuts: Shortcut[]
}
