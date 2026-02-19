import { computed, shallowRef, type Ref } from 'vue'
import type { ContextSuggestion } from '../types'

export function useChatInputEditor(message: Ref<string>) {
  const view = shallowRef()

  // --- Editor handlers ---
  const handleReady = (payload: any) => {
    view.value = payload.view
  }

  const onEditorUpdate = (update: any) => {
    if (update.selectionSet || update.docChanged) {
      syncMenuFromCursor()
      updateEditorHeight()
      handleTypingIndicator()
      fetchContextSuggestions()
    }
  }

  const syncMenuFromCursor = () => {
    const cursorPos = view.value?.state.selection.main.head || 0
    const textBeforeCursor = message.value.slice(0, cursorPos)
    
    // Check for @ mentions
    if (textBeforeCursor.endsWith('@')) {
      // openMenu('mention', '@')
    }
    // Check for / commands
    else if (textBeforeCursor.endsWith('/')) {
      // openMenu('command', '/')
    }
    // Check for # templates
    else if (textBeforeCursor.endsWith('#')) {
      // openMenu('template', '#')
    }
    else {
      // closeMenu()
    }
  }

  const updateEditorHeight = () => {
    const content = message.value
    const lineCount = Math.max(1, content.split('\n').length)
    const newHeight = Math.min(60 + (lineCount - 1) * 24, 400)
    // editorHeight.value = newHeight
  }

  const handleTypingIndicator = () => {
    // Implementation for typing indicator
  }

  const fetchContextSuggestions = async () => {
    // Implementation for context suggestions
  }

  return {
    view,
    handleReady,
    onEditorUpdate,
    syncMenuFromCursor,
    updateEditorHeight,
    handleTypingIndicator,
    fetchContextSuggestions,
  }
}
