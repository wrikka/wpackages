import { ref, onMounted, onUnmounted } from 'vue'

const STORAGE_KEY = 'keyboardShortcuts'

export interface Shortcut {
  id: string
  key: string
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  meta?: boolean
  action: () => void
  description: string
  enabled: boolean
}

export function useKeyboardShortcuts() {
  const shortcuts = ref<Shortcut[]>([])
  const isRecording = ref(false)
  const recordedKeys = ref<string[]>([])

  const loadShortcuts = async () => {
    try {
      const data = await browser.storage.local.get(STORAGE_KEY)
      const saved = data[STORAGE_KEY] as Omit<Shortcut, 'action'>[]
      if (saved) {
        shortcuts.value = saved.map(s => ({ ...s, action: () => {} }))
      }
    } catch (error) {
      console.error('Failed to load shortcuts:', error)
    }
  }

  const saveShortcuts = async () => {
    try {
      const toSave = shortcuts.value.map(({ action, ...rest }) => rest)
      await browser.storage.local.set({ [STORAGE_KEY]: toSave })
    } catch (error) {
      console.error('Failed to save shortcuts:', error)
    }
  }

  const registerShortcut = (shortcut: Shortcut) => {
    const existing = shortcuts.value.find(s => s.id === shortcut.id)
    if (existing) {
      Object.assign(existing, shortcut)
    } else {
      shortcuts.value.push(shortcut)
    }
    saveShortcuts()
  }

  const unregisterShortcut = (id: string) => {
    shortcuts.value = shortcuts.value.filter(s => s.id !== id)
    saveShortcuts()
  }

  const updateShortcut = (id: string, updates: Partial<Shortcut>) => {
    const shortcut = shortcuts.value.find(s => s.id === id)
    if (shortcut) {
      Object.assign(shortcut, updates)
      saveShortcuts()
    }
  }

  const startRecording = () => {
    isRecording.value = true
    recordedKeys.value = []
  }

  const stopRecording = (): string | null => {
    isRecording.value = false
    if (recordedKeys.value.length > 0) {
      return recordedKeys.value.join('+')
    }
    return null
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (isRecording.value) {
      event.preventDefault()
      const keys: string[] = []
      if (event.ctrlKey) keys.push('Ctrl')
      if (event.altKey) keys.push('Alt')
      if (event.shiftKey) keys.push('Shift')
      if (event.metaKey) keys.push('Meta')
      if (!['Control', 'Alt', 'Shift', 'Meta'].includes(event.key)) {
        keys.push(event.key)
      }
      recordedKeys.value = keys
      return
    }

    for (const shortcut of shortcuts.value) {
      if (!shortcut.enabled) continue

      const matches =
        event.key.toLowerCase() === shortcut.key.toLowerCase() &&
        !!event.ctrlKey === !!shortcut.ctrl &&
        !!event.altKey === !!shortcut.alt &&
        !!event.shiftKey === !!shortcut.shift &&
        !!event.metaKey === !!shortcut.meta

      if (matches) {
        event.preventDefault()
        shortcut.action()
        break
      }
    }
  }

  onMounted(() => {
    loadShortcuts()
    document.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })

  return {
    shortcuts,
    isRecording,
    recordedKeys,
    registerShortcut,
    unregisterShortcut,
    updateShortcut,
    startRecording,
    stopRecording,
    loadShortcuts,
    saveShortcuts,
  }
}
