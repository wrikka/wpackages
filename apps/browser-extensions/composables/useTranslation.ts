import { ref } from 'vue'

export function useTranslation() {
  const translateInput = ref('')
  const translateTarget = ref('th')
  const translateResult = ref('')

  const translateText = async () => {
    if (!translateInput.value.trim()) return

    try {
      // Send translation request to background script
      const response = await browser.runtime.sendMessage({
        type: 'TRANSLATE_TEXT',
        text: translateInput.value,
        targetLanguage: translateTarget.value
      })

      if (response?.success) {
        translateResult.value = response.translatedText
      } else {
        translateResult.value = 'Translation failed'
      }
    } catch (error) {
      console.error('Failed to translate text:', error)
      translateResult.value = 'Translation error'
    }
  }

  return {
    translateInput,
    translateTarget,
    translateResult,
    translateText
  }
}
