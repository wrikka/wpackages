import { ref } from 'vue'

const STORAGE_KEY = 'focusModeSettings'

export interface FocusModeSettings {
  enabled: boolean
  hideAds: boolean
  hideComments: boolean
  hideSidebars: boolean
  hideNavigation: boolean
  customSelectors: string[]
  opacity: number
}

const defaultSettings: FocusModeSettings = {
  enabled: false,
  hideAds: true,
  hideComments: true,
  hideSidebars: true,
  hideNavigation: false,
  customSelectors: [],
  opacity: 0.1,
}

export function useFocusMode() {
  const settings = ref<FocusModeSettings>({ ...defaultSettings })
  const isActive = ref(false)

  const loadSettings = async () => {
    try {
      const data = await browser.storage.local.get(STORAGE_KEY)
      settings.value = { ...defaultSettings, ...(data[STORAGE_KEY] as Partial<FocusModeSettings>) }
    } catch (error) {
      console.error('Failed to load focus mode settings:', error)
    }
  }

  const saveSettings = async () => {
    try {
      await browser.storage.local.set({ [STORAGE_KEY]: settings.value })
    } catch (error) {
      console.error('Failed to save focus mode settings:', error)
    }
  }

  const toggleFocusMode = async () => {
    isActive.value = !isActive.value
    await applyFocusMode()
  }

  const applyFocusMode = async () => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id) return

    if (isActive.value) {
      await browser.tabs.sendMessage(tab.id, {
        action: 'enable-focus-mode',
        settings: settings.value,
      })
    } else {
      await browser.tabs.sendMessage(tab.id, {
        action: 'disable-focus-mode',
      })
    }
  }

  const updateSettings = async (updates: Partial<FocusModeSettings>) => {
    settings.value = { ...settings.value, ...updates }
    await saveSettings()
    if (isActive.value) {
      await applyFocusMode()
    }
  }

  // Initialize
  loadSettings()

  return {
    settings,
    isActive,
    toggleFocusMode,
    applyFocusMode,
    updateSettings,
    loadSettings,
    saveSettings,
  }
}
