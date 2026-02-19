import { ref } from 'vue'

const STORAGE_KEY = 'readerViewSettings'

export interface ReaderViewSettings {
  fontSize: number
  fontFamily: string
  lineHeight: number
  maxWidth: number
  theme: 'light' | 'sepia' | 'dark'
  justifyText: boolean
}

const defaultSettings: ReaderViewSettings = {
  fontSize: 18,
  fontFamily: 'system-ui, -apple-system, sans-serif',
  lineHeight: 1.6,
  maxWidth: 700,
  theme: 'light',
  justifyText: false,
}

export function useReaderView() {
  const settings = ref<ReaderViewSettings>({ ...defaultSettings })
  const isActive = ref(false)
  const extractedContent = ref<string>('')

  const loadSettings = async () => {
    try {
      const data = await browser.storage.local.get(STORAGE_KEY)
      settings.value = { ...defaultSettings, ...(data[STORAGE_KEY] as Partial<ReaderViewSettings>) }
    } catch (error) {
      console.error('Failed to load reader view settings:', error)
    }
  }

  const saveSettings = async () => {
    try {
      await browser.storage.local.set({ [STORAGE_KEY]: settings.value })
    } catch (error) {
      console.error('Failed to save reader view settings:', error)
    }
  }

  const updateSettings = async (updates: Partial<ReaderViewSettings>) => {
    settings.value = { ...settings.value, ...updates }
    await saveSettings()
    if (isActive.value) {
      await applyReaderView()
    }
  }

  const extractContent = async (): Promise<string | null> => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id) return null

    try {
      const response = await browser.tabs.sendMessage(tab.id, {
        action: 'extract-article-content',
      })
      
      if (response?.content) {
        extractedContent.value = response.content
        return response.content
      }
    } catch {
      // Silent fail
    }
    
    return null
  }

  const applyReaderView = async () => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id) return

    const content = extractedContent.value || await extractContent()
    if (!content) return

    await browser.tabs.sendMessage(tab.id, {
      action: 'enable-reader-view',
      content,
      settings: settings.value,
    })

    isActive.value = true
  }

  const disableReaderView = async () => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id) return

    await browser.tabs.sendMessage(tab.id, {
      action: 'disable-reader-view',
    })

    isActive.value = false
  }

  const toggleReaderView = async () => {
    if (isActive.value) {
      await disableReaderView()
    } else {
      await applyReaderView()
    }
  }

  const themeClasses = {
    light: 'bg-white text-gray-900',
    sepia: 'bg-[#f4ecd8] text-[#5b4636]',
    dark: 'bg-gray-900 text-gray-100',
  }

  // Initialize
  loadSettings()

  return {
    settings,
    isActive,
    extractedContent,
    themeClasses,
    loadSettings,
    saveSettings,
    updateSettings,
    extractContent,
    applyReaderView,
    disableReaderView,
    toggleReaderView,
  }
}
