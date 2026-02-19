import { ref } from 'vue'
import type { ChatMessage, Bookmark, Note, CustomPrompt, ExtensionSettings } from '@/types'

const STORAGE_KEYS = {
  CHAT_MESSAGES: 'chatMessages',
  BOOKMARKS: 'bookmarks',
  NOTES: 'notes',
  CUSTOM_PROMPTS: 'customPrompts',
  PAGE_CONTENT: 'pageContent',
  SETTINGS: 'settings'
}

export function useStorage() {
  // Reactive storage values
  const chatMessages = ref<ChatMessage[]>([])
  const bookmarks = ref<Bookmark[]>([])
  const notes = ref<Note[]>([])
  const customPrompts = ref<CustomPrompt[]>([])
  const pageContent = ref('')
  const settings = ref<ExtensionSettings>({
    enabled: true,
    autoStart: false,
    theme: 'dark'
  })

  // Load from storage
  const loadFromStorage = async () => {
    try {
      const data = await browser.storage.local.get(Object.values(STORAGE_KEYS))
      
      chatMessages.value = (data.chatMessages as ChatMessage[]) || []
      bookmarks.value = (data.bookmarks as Bookmark[]) || []
      notes.value = (data.notes as Note[]) || []
      customPrompts.value = (data.customPrompts as CustomPrompt[]) || []
      pageContent.value = (data.pageContent as string) || ''
      settings.value = { ...settings.value, ...(data.settings as Partial<ExtensionSettings>) }
    } catch (error) {
      console.error('Failed to load from storage:', error)
    }
  }

  // Save functions
  const saveChatHistory = async () => {
    try {
      await browser.storage.local.set({ [STORAGE_KEYS.CHAT_MESSAGES]: chatMessages.value })
    } catch (error) {
      console.error('Failed to save chat history:', error)
    }
  }

  const saveBookmarks = async () => {
    try {
      await browser.storage.local.set({ [STORAGE_KEYS.BOOKMARKS]: bookmarks.value })
    } catch (error) {
      console.error('Failed to save bookmarks:', error)
    }
  }

  const saveNotes = async () => {
    try {
      await browser.storage.local.set({ [STORAGE_KEYS.NOTES]: notes.value })
    } catch (error) {
      console.error('Failed to save notes:', error)
    }
  }

  const saveCustomPrompts = async () => {
    try {
      await browser.storage.local.set({ [STORAGE_KEYS.CUSTOM_PROMPTS]: customPrompts.value })
    } catch (error) {
      console.error('Failed to save custom prompts:', error)
    }
  }

  const savePageContent = async (content: string) => {
    try {
      pageContent.value = content
      await browser.storage.local.set({ [STORAGE_KEYS.PAGE_CONTENT]: content })
    } catch (error) {
      console.error('Failed to save page content:', error)
    }
  }

  const saveSettings = async () => {
    try {
      await browser.storage.local.set({ [STORAGE_KEYS.SETTINGS]: settings.value })
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  // Clear functions
  const clearPageContent = async () => {
    pageContent.value = ''
    try {
      await browser.storage.local.remove(STORAGE_KEYS.PAGE_CONTENT)
    } catch (error) {
      console.error('Failed to clear page content:', error)
    }
  }

  const setPageContent = savePageContent

  // Initialize
  loadFromStorage()

  return {
    // Reactive values
    chatMessages,
    bookmarks,
    notes,
    customPrompts,
    pageContent,
    settings,
    
    // Save functions
    saveChatHistory,
    saveBookmarks,
    saveNotes,
    saveCustomPrompts,
    savePageContent,
    saveSettings,
    
    // Utility functions
    clearPageContent,
    setPageContent,
    loadFromStorage
  }
}
