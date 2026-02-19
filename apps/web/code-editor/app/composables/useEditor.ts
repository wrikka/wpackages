import { ref, computed } from 'vue'
import type { EditorConfig, EditorPosition, EditorAction } from '@shared/types'

export const useEditor = (initialConfig?: Partial<EditorConfig>) => {
  const config = ref<EditorConfig>({
    language: 'typescript',
    theme: 'vs-dark',
    fontSize: 14,
    wordWrap: true,
    minimap: true,
    lineNumbers: true,
    ...initialConfig
  })

  const content = ref('')
  const cursorPosition = ref<EditorPosition>({ line: 1, column: 1 })
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isDirty = computed(() => {
    return content.value !== content.value
  })

  const updateConfig = (newConfig: Partial<EditorConfig>) => {
    config.value = { ...config.value, ...newConfig }
  }

  const setContent = (newContent: string) => {
    content.value = newContent
  }

  const insertText = (text: string) => {
    content.value += text
  }

  const executeAction = async (action: EditorAction) => {
    try {
      loading.value = true
      error.value = null

      switch (action.type) {
        case 'save':
          await $fetch('/api/editor/save', {
            method: 'POST',
            body: { content: content.value, config: config.value }
          })
          break
        case 'run':
          await $fetch('/api/editor/run', {
            method: 'POST',
            body: { content: content.value, language: config.value.language }
          })
          break
        case 'format':
          const formatted = await $fetch('/api/editor/format', {
            method: 'POST',
            body: { content: content.value, language: config.value.language }
          })
          content.value = formatted
          break
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : `Failed to ${action.type}`
    } finally {
      loading.value = false
    }
  }

  const handleKeyboardShortcut = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 's':
          event.preventDefault()
          executeAction({ type: 'save' })
          break
        case 'Enter':
          event.preventDefault()
          executeAction({ type: 'run' })
          break
        case 'f':
          event.preventDefault()
          executeAction({ type: 'format' })
          break
      }
    }
  }

  return {
    config,
    content,
    cursorPosition,
    loading,
    error,
    isDirty,
    updateConfig,
    setContent,
    insertText,
    executeAction,
    handleKeyboardShortcut
  }
}
