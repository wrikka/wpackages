import { EditorView, keymap } from '@codemirror/view'
import { computed, ref } from 'vue'

export function useCodeMirrorExtensions() {
  const isLikelyCode = (text: string) => {
    // Simple heuristic: check for common code characters and patterns
    const codeChars = /[{};<>()/\t]/
    const lineCount = text.split('\n').length
    const hasCodeChars = codeChars.test(text)
    const hasMultipleLines = lineCount > 1
    const hasIndentation = /^\s+/.test(text)

    return (hasCodeChars && hasMultipleLines) || hasIndentation || (lineCount > 5)
  }

  const smartPasteExtension = EditorView.domEventHandlers({
    paste(event, view) {
      const clipboardData = event.clipboardData || (window as any).clipboardData
      const pastedText = clipboardData.getData('text')

      if (isLikelyCode(pastedText)) {
        event.preventDefault()
        const formattedText = `\`\`\`\n${pastedText}\n\`\`\``
        const { from, to } = view.state.selection.main
        view.dispatch({
          changes: { from, to, insert: formattedText },
          selection: { anchor: from + formattedText.length },
        })
        return true
      }
      return false
    },
  })

  const createExtensions = (baseExtensions: any[] = []) => {
    return computed(() => {
      return [
        ...baseExtensions,
        smartPasteExtension,
        EditorView.lineWrapping,
        keymap.of([
          {
            key: 'Enter',
            run: (view) => {
              // Handle Enter key for sending message
              return false // Let parent handle
            },
          },
          {
            key: 'Mod-Enter',
            run: (view) => {
              // Handle Cmd/Ctrl+Enter for new line
              return false // Let parent handle
            },
          },
        ]),
      ]
    })
  }

  return {
    isLikelyCode,
    smartPasteExtension,
    createExtensions,
  }
}
