import { ref, computed } from 'vue'

export interface ReadingTimeResult {
  minutes: number
  words: number
  characters: number
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedSeconds: number
}

export function useReadingTime() {
  const content = ref('')
  const wpm = ref(200) // Average words per minute

  const readingTime = computed<ReadingTimeResult>(() => {
    const text = content.value.trim()
    if (!text) {
      return {
        minutes: 0,
        words: 0,
        characters: 0,
        difficulty: 'easy',
        estimatedSeconds: 0,
      }
    }

    const words = text.split(/\s+/).filter(w => w.length > 0).length
    const characters = text.length
    const syllables = estimateSyllables(text)
    
    // Flesch-Kincaid reading ease approximation
    const avgWordsPerSentence = words / (text.split(/[.!?]+/).length || 1)
    const avgSyllablesPerWord = syllables / words || 1
    
    let difficulty: 'easy' | 'medium' | 'hard' = 'medium'
    if (avgWordsPerSentence < 15 && avgSyllablesPerWord < 1.5) {
      difficulty = 'easy'
    } else if (avgWordsPerSentence > 25 || avgSyllablesPerWord > 2) {
      difficulty = 'hard'
    }

    // Adjust WPM based on difficulty
    const adjustedWpm = difficulty === 'easy' ? wpm.value + 50 : 
                       difficulty === 'hard' ? wpm.value - 50 : wpm.value

    const minutes = Math.ceil(words / adjustedWpm)
    const estimatedSeconds = Math.round((words / adjustedWpm) * 60)

    return {
      minutes,
      words,
      characters,
      difficulty,
      estimatedSeconds,
    }
  })

  const estimateSyllables = (text: string): number => {
    const words = text.toLowerCase().split(/\s+/)
    let count = 0
    
    for (const word of words) {
      const cleanWord = word.replace(/[^a-z]/g, '')
      if (!cleanWord) continue
      
      // Simple syllable counting heuristic
      const vowels = cleanWord.match(/[aeiouy]/g)
      let syllables = vowels ? vowels.length : 1
      
      // Subtract silent e
      if (cleanWord.endsWith('e')) syllables--
      
      // Ensure at least 1 syllable
      count += Math.max(1, syllables)
    }
    
    return count
  }

  const setContent = (text: string) => {
    content.value = text
  }

  const calculateFromPage = async (): Promise<ReadingTimeResult | null> => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id) return null

    try {
      const response = await browser.tabs.sendMessage(tab.id, {
        action: 'get-page-content',
      })
      
      if (response?.content) {
        setContent(response.content)
        return readingTime.value
      }
    } catch {
      // Silent fail
    }
    
    return null
  }

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`
    }
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
  }

  return {
    content,
    wpm,
    readingTime,
    setContent,
    calculateFromPage,
    formatTime,
  }
}
