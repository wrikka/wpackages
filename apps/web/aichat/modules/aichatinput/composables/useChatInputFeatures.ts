import { ref, computed, type Ref } from 'vue'
import type { ContextSuggestion, MenuItem } from '../types'

export function useChatInputFeatures(message: Ref<string>) {
  // --- Smart Input State ---
  const editorHeight = ref(60)
  const showTypingIndicator = ref(false)
  const contextSuggestions = ref<ContextSuggestion[]>([])
  const typingTimer = ref<NodeJS.Timeout | null>(null)

  // --- Methods ---
  const updateEditorHeight = () => {
    const content = message.value
    const lineCount = Math.max(1, content.split('\n').length)
    const newHeight = Math.min(60 + (lineCount - 1) * 24, 400)
    editorHeight.value = newHeight
  }

  const handleTypingIndicator = () => {
    if (typingTimer.value) {
      clearTimeout(typingTimer.value)
    }

    showTypingIndicator.value = true
    typingTimer.value = setTimeout(() => {
      showTypingIndicator.value = false
    }, 1000)
  }

  const fetchContextSuggestions = async () => {
    if (message.value.length < 3) {
      contextSuggestions.value = []
      return
    }

    try {
      // Simulate context suggestions API call
      const suggestions: ContextSuggestion[] = [
        { id: '1', text: 'Explain this concept', type: 'action' },
        { id: '2', text: 'Show me examples', type: 'action' },
        { id: '3', text: 'Convert to code', type: 'action' },
        { id: '4', text: 'Simplify this', type: 'action' },
        { id: '5', text: 'Add more details', type: 'action' },
      ]

      contextSuggestions.value = suggestions.filter(s =>
        s.text.toLowerCase().includes(message.value.toLowerCase())
      )
    } catch (error) {
      contextSuggestions.value = []
    }
  }

  const applySuggestion = (suggestion: ContextSuggestion, messageRef: Ref<string>, viewRef: any) => {
    messageRef.value = suggestion.text
    contextSuggestions.value = []
    viewRef.value?.focus()
  }

  return {
    // State
    editorHeight,
    showTypingIndicator,
    contextSuggestions,
    typingTimer,

    // Methods
    updateEditorHeight,
    handleTypingIndicator,
    fetchContextSuggestions,
    applySuggestion,
  }
}
