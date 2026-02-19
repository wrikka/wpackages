import { ref, nextTick } from 'vue'
import { marked } from 'marked'
import type { ChatMessage } from '@/types'

export function useChat(chatMessagesRef?: any, onSaveCallback?: () => void) {
  const inputMessage = ref('')
  const isStreaming = ref(false)

  const renderMarkdown = (content: string) => {
    try {
      return marked(content)
    } catch (error) {
      console.error('Failed to render markdown:', error)
      return content
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.value.trim() || isStreaming.value) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.value,
      timestamp: Date.now()
    }

    if (chatMessagesRef?.value) {
      chatMessagesRef.value.push(userMessage)
    }

    const messageContent = inputMessage.value
    inputMessage.value = ''
    isStreaming.value = true

    try {
      // Send message to background script for AI processing
      const response = await browser.runtime.sendMessage({
        type: 'SEND_CHAT_MESSAGE',
        message: messageContent
      })

      if (response?.success) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.response || 'Sorry, I could not process your message.',
          timestamp: Date.now()
        }

        if (chatMessagesRef?.value) {
          chatMessagesRef.value.push(assistantMessage)
        }

        if (onSaveCallback) {
          await onSaveCallback()
        }
      } else {
        throw new Error(response?.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Failed to send chat message:', error)
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your message.',
        timestamp: Date.now()
      }

      if (chatMessagesRef?.value) {
        chatMessagesRef.value.push(errorMessage)
      }
    } finally {
      isStreaming.value = false
      await nextTick()
    }
  }

  return {
    inputMessage,
    isStreaming,
    renderMarkdown,
    sendMessage
  }
}
