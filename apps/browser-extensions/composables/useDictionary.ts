import { ref } from 'vue'

export interface Definition {
  word: string
  partOfSpeech: string
  definition: string
  example?: string
  synonyms: string[]
  antonyms: string[]
}

export interface LookupResult {
  word: string
  phonetic?: string
  audio?: string
  definitions: Definition[]
  source: string
}

const CACHE_KEY = 'dictionaryCache'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

export function useDictionary() {
  const isLoading = ref(false)
  const lastResult = ref<LookupResult | null>(null)
  const recentLookups = ref<string[]>([])
  const cache = ref<Map<string, { result: LookupResult; timestamp: number }>>(new Map())

  const loadCache = async () => {
    try {
      const data = await browser.storage.local.get(CACHE_KEY)
      const stored = data[CACHE_KEY] as Record<string, { result: LookupResult; timestamp: number }>
      if (stored) {
        cache.value = new Map(Object.entries(stored))
        // Clean expired entries
        const now = Date.now()
        for (const [key, value] of cache.value.entries()) {
          if (now - value.timestamp > CACHE_DURATION) {
            cache.value.delete(key)
          }
        }
      }
    } catch (error) {
      console.error('Failed to load dictionary cache:', error)
    }
  }

  const saveCache = async () => {
    try {
      const obj = Object.fromEntries(cache.value.entries())
      await browser.storage.local.set({ [CACHE_KEY]: obj })
    } catch (error) {
      console.error('Failed to save dictionary cache:', error)
    }
  }

  const lookup = async (word: string): Promise<LookupResult | null> => {
    if (!word.trim()) return null

    const normalized = word.toLowerCase().trim()

    // Check cache
    const cached = cache.value.get(normalized)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      lastResult.value = cached.result
      addToRecent(normalized)
      return cached.result
    }

    isLoading.value = true
    try {
      // Using Free Dictionary API
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(normalized)}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!Array.isArray(data) || data.length === 0) {
        return null
      }

      const entry = data[0]
      const result: LookupResult = {
        word: entry.word,
        phonetic: entry.phonetic,
        audio: entry.phonetics?.find((p: { audio?: string }) => p.audio)?.audio,
        definitions: [],
        source: 'Free Dictionary API',
      }

      for (const meaning of entry.meanings || []) {
        for (const def of meaning.definitions || []) {
          result.definitions.push({
            word: entry.word,
            partOfSpeech: meaning.partOfSpeech,
            definition: def.definition,
            example: def.example,
            synonyms: def.synonyms || [],
            antonyms: def.antonyms || [],
          })
        }
      }

      // Cache result
      cache.value.set(normalized, { result, timestamp: Date.now() })
      await saveCache()

      lastResult.value = result
      addToRecent(normalized)
      
      return result
    } catch (error) {
      console.error('Dictionary lookup failed:', error)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const addToRecent = (word: string) => {
    recentLookups.value = [word, ...recentLookups.value.filter(w => w !== word)].slice(0, 20)
  }

  const lookupSelectedText = async (): Promise<LookupResult | null> => {
    // Get selected text from content script
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id) return null

    try {
      const response = await browser.tabs.sendMessage(tab.id, {
        action: 'get-selected-text',
      })
      
      if (response?.text) {
        return await lookup(response.text)
      }
    } catch {
      // Silent fail
    }
    
    return null
  }

  const clearCache = async () => {
    cache.value.clear()
    await browser.storage.local.remove(CACHE_KEY)
  }

  // Initialize
  loadCache()

  return {
    isLoading,
    lastResult,
    recentLookups,
    lookup,
    lookupSelectedText,
    clearCache,
    loadCache,
    saveCache,
  }
}
