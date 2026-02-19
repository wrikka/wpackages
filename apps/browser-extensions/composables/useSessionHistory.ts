import { ref, computed } from 'vue'
import type { HistoryItem, HistoryFilter } from '@/types'

const STORAGE_KEY = 'sessionHistory'

export function useSessionHistory() {
  const history = ref<HistoryItem[]>([])
  const filter = ref<HistoryFilter>('all')
  const searchQuery = ref('')

  const loadHistory = async () => {
    try {
      const data = await browser.storage.local.get(STORAGE_KEY)
      history.value = (data[STORAGE_KEY] as HistoryItem[]) || []
    } catch (error) {
      console.error('Failed to load history:', error)
    }
  }

  const addHistoryItem = async (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    }
    history.value.unshift(newItem)
    // Keep only last 100 items
    if (history.value.length > 100) {
      history.value = history.value.slice(0, 100)
    }
    await saveHistory()
  }

  const saveHistory = async () => {
    try {
      await browser.storage.local.set({ [STORAGE_KEY]: history.value })
    } catch (error) {
      console.error('Failed to save history:', error)
    }
  }

  const clearHistory = async () => {
    history.value = []
    await browser.storage.local.remove(STORAGE_KEY)
  }

  const deleteHistoryItem = async (id: string) => {
    history.value = history.value.filter(item => item.id !== id)
    await saveHistory()
  }

  const filteredHistory = computed(() => {
    let result = history.value

    if (filter.value !== 'all') {
      result = result.filter(item => item.type === filter.value)
    }

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(item =>
        item.title?.toLowerCase().includes(query) ||
        item.url?.toLowerCase().includes(query) ||
        item.content?.toLowerCase().includes(query)
      )
    }

    return result
  })

  const historyStats = computed(() => {
    const today = new Date().setHours(0, 0, 0, 0)
    return {
      total: history.value.length,
      today: history.value.filter(h => h.timestamp >= today).length,
      byType: {
        chat: history.value.filter(h => h.type === 'chat').length,
        summary: history.value.filter(h => h.type === 'summary').length,
        bookmark: history.value.filter(h => h.type === 'bookmark').length,
        note: history.value.filter(h => h.type === 'note').length,
      }
    }
  })

  // Initialize
  loadHistory()

  return {
    history,
    filter,
    searchQuery,
    filteredHistory,
    historyStats,
    addHistoryItem,
    clearHistory,
    deleteHistoryItem,
    loadHistory,
  }
}
