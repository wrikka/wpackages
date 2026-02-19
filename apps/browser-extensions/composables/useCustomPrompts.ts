import { ref } from 'vue'
import type { CustomPrompt } from '@/types'

export function useCustomPrompts(
  customPromptsRef?: any,
  saveFunction?: () => Promise<void>,
  inputMessageRef?: any,
  activeTabRef?: any
) {
  const newPromptName = ref('')
  const newPromptTemplate = ref('')

  const addPrompt = async () => {
    if (!newPromptName.value.trim() || !newPromptTemplate.value.trim()) return

    const newPrompt: CustomPrompt = {
      id: Date.now().toString(),
      name: newPromptName.value,
      template: newPromptTemplate.value,
      createdAt: Date.now()
    }

    if (customPromptsRef?.value) {
      customPromptsRef.value.push(newPrompt)
    }

    newPromptName.value = ''
    newPromptTemplate.value = ''

    if (saveFunction) {
      await saveFunction()
    }
  }

  const deletePrompt = async (id: string) => {
    if (customPromptsRef?.value) {
      const index = customPromptsRef.value.findIndex((prompt: CustomPrompt) => prompt.id === id)
      if (index > -1) {
        customPromptsRef.value.splice(index, 1)
      }
    }

    if (saveFunction) {
      await saveFunction()
    }
  }

  const usePrompt = (prompt: CustomPrompt) => {
    if (inputMessageRef && activeTabRef) {
      const selectedText = window.getSelection()?.toString() || ''
      const message = prompt.template.replace('{text}', selectedText)
      inputMessageRef.value = message
      activeTabRef.value = 'chat'
    }
  }

  return {
    newPromptName,
    newPromptTemplate,
    addPrompt,
    deletePrompt,
    usePrompt
  }
}
