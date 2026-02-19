import { ref } from 'vue'

const STORAGE_KEY = 'translationSettings'

export interface TranslationSettings {
  enabled: boolean
  targetLanguage: string
  autoTranslate: boolean
  showOriginal: boolean
  preferredLanguages: string[]
}

const defaultSettings: TranslationSettings = {
  enabled: false,
  targetLanguage: 'en',
  autoTranslate: false,
  showOriginal: true,
  preferredLanguages: ['en', 'th', 'ja', 'zh', 'ko'],
}

const languageOptions = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
]

export function useAutoTranslate() {
  const settings = ref<TranslationSettings>({ ...defaultSettings })
  const isTranslating = ref(false)
  const detectedLanguage = ref<string | null>(null)

  const loadSettings = async () => {
    try {
      const data = await browser.storage.local.get(STORAGE_KEY)
      settings.value = { ...defaultSettings, ...(data[STORAGE_KEY] as Partial<TranslationSettings>) }
    } catch (error) {
      console.error('Failed to load translation settings:', error)
    }
  }

  const saveSettings = async () => {
    try {
      await browser.storage.local.set({ [STORAGE_KEY]: settings.value })
    } catch (error) {
      console.error('Failed to save translation settings:', error)
    }
  }

  const translatePage = async (targetLang?: string) => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id) return

    isTranslating.value = true
    try {
      await browser.tabs.sendMessage(tab.id, {
        action: 'translate-page',
        targetLanguage: targetLang || settings.value.targetLanguage,
        showOriginal: settings.value.showOriginal,
      })
    } finally {
      isTranslating.value = false
    }
  }

  const detectLanguage = async (text: string): Promise<string | null> => {
    // Simple detection based on character ranges
    if (/[\u0E00-\u0E7F]/.test(text)) return 'th'
    if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return 'ja'
    if (/[\u4E00-\u9FFF]/.test(text)) return 'zh'
    if (/[\uAC00-\uD7AF]/.test(text)) return 'ko'
    if (/[\u0600-\u06FF]/.test(text)) return 'ar'
    if (/[\u0400-\u04FF]/.test(text)) return 'ru'
    return 'en'
  }

  const updateSettings = async (updates: Partial<TranslationSettings>) => {
    settings.value = { ...settings.value, ...updates }
    await saveSettings()
  }

  const translateText = async (text: string, targetLang: string): Promise<string> => {
    // In a real implementation, this would call a translation API
    // For now, return a placeholder
    return `[${targetLang.toUpperCase()}] ${text}`
  }

  // Initialize
  loadSettings()

  return {
    settings,
    isTranslating,
    detectedLanguage,
    languageOptions,
    translatePage,
    detectLanguage,
    translateText,
    updateSettings,
    loadSettings,
    saveSettings,
  }
}
