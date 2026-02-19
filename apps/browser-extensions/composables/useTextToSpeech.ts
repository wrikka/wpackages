import { ref } from 'vue'

export function useTextToSpeech() {
  const isSpeaking = ref(false)
  const isPaused = ref(false)
  const currentUtterance = ref<SpeechSynthesisUtterance | null>(null)

  const speak = (text: string, options?: {
    rate?: number
    pitch?: number
    volume?: number
    lang?: string
    voice?: SpeechSynthesisVoice
  }) => {
    if (!('speechSynthesis' in window)) {
      console.error('Text-to-speech not supported')
      return
    }

    // Cancel any ongoing speech
    stop()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = options?.rate ?? 1
    utterance.pitch = options?.pitch ?? 1
    utterance.volume = options?.volume ?? 1
    utterance.lang = options?.lang ?? 'en-US'

    if (options?.voice) {
      utterance.voice = options.voice
    }

    utterance.onstart = () => {
      isSpeaking.value = true
      isPaused.value = false
    }

    utterance.onend = () => {
      isSpeaking.value = false
      isPaused.value = false
      currentUtterance.value = null
    }

    utterance.onpause = () => {
      isPaused.value = true
    }

    utterance.onresume = () => {
      isPaused.value = false
    }

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error)
      isSpeaking.value = false
      isPaused.value = false
    }

    currentUtterance.value = utterance
    window.speechSynthesis.speak(utterance)
  }

  const pause = () => {
    if (isSpeaking.value && !isPaused.value) {
      window.speechSynthesis.pause()
      isPaused.value = true
    }
  }

  const resume = () => {
    if (isSpeaking.value && isPaused.value) {
      window.speechSynthesis.resume()
      isPaused.value = false
    }
  }

  const stop = () => {
    window.speechSynthesis.cancel()
    isSpeaking.value = false
    isPaused.value = false
    currentUtterance.value = null
  }

  const getVoices = (): SpeechSynthesisVoice[] => {
    return window.speechSynthesis.getVoices()
  }

  return {
    isSpeaking,
    isPaused,
    currentUtterance,
    speak,
    pause,
    resume,
    stop,
    getVoices,
  }
}
