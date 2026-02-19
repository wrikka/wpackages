import { ref } from 'vue'

const STORAGE_KEY = 'moodEntries'

export interface MoodEntry {
  id: string
  timestamp: number
  mood: 'happy' | 'neutral' | 'sad' | 'excited' | 'tired' | 'focused'
  note?: string
  url?: string
  title?: string
}

export function useMoodTracker() {
  const entries = ref<MoodEntry[]>([])
  const currentMood = ref<MoodEntry['mood'] | null>(null)

  const moodOptions: { value: MoodEntry['mood']; emoji: string; label: string; color: string }[] = [
    { value: 'happy', emoji: '😊', label: 'Happy', color: '#22c55e' },
    { value: 'excited', emoji: '🤩', label: 'Excited', color: '#f59e0b' },
    { value: 'focused', emoji: '🎯', label: 'Focused', color: '#3b82f6' },
    { value: 'neutral', emoji: '😐', label: 'Neutral', color: '#6b7280' },
    { value: 'tired', emoji: '😴', label: 'Tired', color: '#8b5cf6' },
    { value: 'sad', emoji: '😢', label: 'Sad', color: '#ef4444' },
  ]

  const loadEntries = async () => {
    try {
      const data = await browser.storage.local.get(STORAGE_KEY)
      entries.value = (data[STORAGE_KEY] as MoodEntry[]) || []
    } catch (error) {
      console.error('Failed to load mood entries:', error)
    }
  }

  const addEntry = async (mood: MoodEntry['mood'], note?: string) => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    
    const entry: MoodEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      mood,
      note,
      url: tab?.url,
      title: tab?.title,
    }

    entries.value.unshift(entry)
    currentMood.value = mood

    // Keep only last 30 days
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    entries.value = entries.value.filter(e => e.timestamp > thirtyDaysAgo)

    await saveEntries()
  }

  const saveEntries = async () => {
    try {
      await browser.storage.local.set({ [STORAGE_KEY]: entries.value })
    } catch (error) {
      console.error('Failed to save mood entries:', error)
    }
  }

  const deleteEntry = async (id: string) => {
    entries.value = entries.value.filter(e => e.id !== id)
    await saveEntries()
  }

  const getMoodStats = () => {
    const stats: Record<string, number> = {}
    for (const entry of entries.value) {
      stats[entry.mood] = (stats[entry.mood] || 0) + 1
    }
    return stats
  }

  const getWeeklyTrend = () => {
    const week: Record<string, number> = {}
    const now = Date.now()
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000)
      const key = date.toLocaleDateString('en-US', { weekday: 'short' })
      week[key] = 0
    }
    
    for (const entry of entries.value) {
      const date = new Date(entry.timestamp)
      const key = date.toLocaleDateString('en-US', { weekday: 'short' })
      if (key in week) {
        week[key]++
      }
    }
    
    return week
  }

  // Initialize
  loadEntries()

  return {
    entries,
    currentMood,
    moodOptions,
    addEntry,
    deleteEntry,
    getMoodStats,
    getWeeklyTrend,
    loadEntries,
  }
}
