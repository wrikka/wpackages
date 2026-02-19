import { ref, computed } from 'vue'

export interface PageSnapshot {
  id: string
  url: string
  title: string
  content: string
  timestamp: number
  screenshot?: string
}

export interface PageComparison {
  id: string
  leftPage: PageSnapshot
  rightPage: PageSnapshot
  differences: TextDifference[]
  createdAt: number
}

export interface TextDifference {
  type: 'added' | 'removed' | 'unchanged'
  value: string
  line: number
}

const STORAGE_KEY = 'pageComparisons'

export function usePageComparison() {
  const comparisons = ref<PageComparison[]>([])
  const leftPage = ref<PageSnapshot | null>(null)
  const rightPage = ref<PageSnapshot | null>(null)

  const loadComparisons = async () => {
    try {
      const data = await browser.storage.local.get(STORAGE_KEY)
      comparisons.value = (data[STORAGE_KEY] as PageComparison[]) || []
    } catch (error) {
      console.error('Failed to load comparisons:', error)
    }
  }

  const capturePage = async (): Promise<PageSnapshot | null> => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id) return null

    try {
      const response = await browser.tabs.sendMessage(tab.id, {
        action: 'get-page-content',
      })

      return {
        id: crypto.randomUUID(),
        url: tab.url || '',
        title: tab.title || '',
        content: response?.content || '',
        timestamp: Date.now(),
      }
    } catch {
      return null
    }
  }

  const setLeftPage = async () => {
    const page = await capturePage()
    if (page) {
      leftPage.value = page
    }
  }

  const setRightPage = async () => {
    const page = await capturePage()
    if (page) {
      rightPage.value = page
    }
  }

  const computeDifferences = (left: string, right: string): TextDifference[] => {
    const leftLines = left.split('\n')
    const rightLines = right.split('\n')
    const differences: TextDifference[] = []
    let i = 0
    let j = 0

    while (i < leftLines.length || j < rightLines.length) {
      if (i >= leftLines.length) {
        differences.push({ type: 'added', value: rightLines[j], line: j + 1 })
        j++
      } else if (j >= rightLines.length) {
        differences.push({ type: 'removed', value: leftLines[i], line: i + 1 })
        i++
      } else if (leftLines[i] === rightLines[j]) {
        differences.push({ type: 'unchanged', value: leftLines[i], line: i + 1 })
        i++
        j++
      } else {
        differences.push({ type: 'removed', value: leftLines[i], line: i + 1 })
        differences.push({ type: 'added', value: rightLines[j], line: j + 1 })
        i++
        j++
      }
    }

    return differences
  }

  const comparePages = async (): Promise<PageComparison | null> => {
    if (!leftPage.value || !rightPage.value) return null

    const differences = computeDifferences(
      leftPage.value.content,
      rightPage.value.content
    )

    const comparison: PageComparison = {
      id: crypto.randomUUID(),
      leftPage: leftPage.value,
      rightPage: rightPage.value,
      differences,
      createdAt: Date.now(),
    }

    comparisons.value.unshift(comparison)
    await saveComparisons()

    return comparison
  }

  const saveComparisons = async () => {
    try {
      await browser.storage.local.set({ [STORAGE_KEY]: comparisons.value })
    } catch (error) {
      console.error('Failed to save comparisons:', error)
    }
  }

  const deleteComparison = async (id: string) => {
    comparisons.value = comparisons.value.filter(c => c.id !== id)
    await saveComparisons()
  }

  const clearPages = () => {
    leftPage.value = null
    rightPage.value = null
  }

  const diffStats = computed(() => {
    if (!leftPage.value || !rightPage.value) return null
    const differences = computeDifferences(leftPage.value.content, rightPage.value.content)
    return {
      added: differences.filter(d => d.type === 'added').length,
      removed: differences.filter(d => d.type === 'removed').length,
      unchanged: differences.filter(d => d.type === 'unchanged').length,
    }
  })

  // Initialize
  loadComparisons()

  return {
    comparisons,
    leftPage,
    rightPage,
    diffStats,
    setLeftPage,
    setRightPage,
    comparePages,
    deleteComparison,
    clearPages,
    loadComparisons,
    saveComparisons,
  }
}
