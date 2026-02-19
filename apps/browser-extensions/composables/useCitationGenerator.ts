import { ref } from 'vue'

export type CitationStyle = 'apa' | 'mla' | 'chicago' | 'harvard' | 'ieee' | 'vancouver'

export interface CitationData {
  url: string
  title: string
  author?: string
  siteName?: string
  publishDate?: string
  accessDate: string
}

export interface GeneratedCitation {
  style: CitationStyle
  inText: string
  full: string
  bibliography: string
}

const STORAGE_KEY = 'citationHistory'

export function useCitationGenerator() {
  const citationHistory = ref<GeneratedCitation[]>([])
  const currentCitation = ref<GeneratedCitation | null>(null)

  const styleOptions: { value: CitationStyle; label: string }[] = [
    { value: 'apa', label: 'APA (7th Edition)' },
    { value: 'mla', label: 'MLA (9th Edition)' },
    { value: 'chicago', label: 'Chicago/Turabian' },
    { value: 'harvard', label: 'Harvard' },
    { value: 'ieee', label: 'IEEE' },
    { value: 'vancouver', label: 'Vancouver' },
  ]

  const loadHistory = async () => {
    try {
      const data = await browser.storage.local.get(STORAGE_KEY)
      citationHistory.value = (data[STORAGE_KEY] as GeneratedCitation[]) || []
    } catch (error) {
      console.error('Failed to load citation history:', error)
    }
  }

  const saveHistory = async () => {
    try {
      await browser.storage.local.set({ [STORAGE_KEY]: citationHistory.value.slice(0, 50) })
    } catch (error) {
      console.error('Failed to save citation history:', error)
    }
  }

  const extractPageData = async (): Promise<CitationData | null> => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (!tab?.url) return null

    // Try to get metadata from page
    try {
      const response = await browser.tabs.sendMessage(tab.id!, {
        action: 'get-page-metadata',
      })

      return {
        url: tab.url,
        title: response?.title || tab.title || '',
        author: response?.author,
        siteName: response?.siteName,
        publishDate: response?.publishDate,
        accessDate: new Date().toISOString().split('T')[0],
      }
    } catch {
      // Fallback
      return {
        url: tab.url,
        title: tab.title || '',
        accessDate: new Date().toISOString().split('T')[0],
      }
    }
  }

  const formatAuthor = (author: string | undefined, style: CitationStyle): string => {
    if (!author) return ''

    const names = author.split(' ')
    const lastName = names.pop()
    const firstName = names.join(' ')

    switch (style) {
      case 'apa':
      case 'harvard':
        return `${lastName}, ${firstName.charAt(0)}.`
      case 'mla':
        return `${lastName}, ${firstName}`
      case 'chicago':
        return `${lastName}, ${firstName}`
      case 'ieee':
        return `${firstName.charAt(0)}. ${lastName}`
      case 'vancouver':
        return `${lastName} ${firstName.charAt(0)}`
      default:
        return author
    }
  }

  const generateCitation = (data: CitationData, style: CitationStyle): GeneratedCitation => {
    const author = formatAuthor(data.author, style)
    const year = data.publishDate ? new Date(data.publishDate).getFullYear() : new Date().getFullYear()
    const siteName = data.siteName || new URL(data.url).hostname.replace(/^www\./, '')

    let inText = ''
    let full = ''
    let bibliography = ''

    switch (style) {
      case 'apa':
        inText = author ? `(${author.split(',')[0]}, ${year})` : `(${siteName}, ${year})`
        full = `${author || siteName}. (${year}). ${data.title}. ${siteName}. ${data.url}`
        bibliography = `${author || siteName}. (${year}). ${data.title}. Retrieved ${data.accessDate}, from ${data.url}`
        break

      case 'mla':
        inText = author ? `(${author.split(',')[0]})` : `("${data.title.slice(0, 20)}...")`
        full = `${author || siteName}. "${data.title}." ${siteName}, ${data.publishDate || 'n.d.'}, ${data.url}.`
        bibliography = `${author || siteName}. "${data.title}." ${siteName}, ${data.publishDate || 'n.d.'}, ${data.url}. Accessed ${data.accessDate}.`
        break

      case 'chicago':
        inText = author ? `${author.split(',')[0]}, "${data.title.slice(0, 20)}..."` : `"${data.title.slice(0, 20)}..."`
        full = `${author || siteName}. "${data.title}." ${siteName}. Last modified ${data.publishDate || 'n.d.'}. ${data.url}.`
        bibliography = `${author || siteName}. "${data.title}." ${siteName}. Last modified ${data.publishDate || 'n.d.'}. Accessed ${data.accessDate}. ${data.url}.`
        break

      case 'harvard':
        inText = author ? `(${author.split(',')[0]}, ${year})` : `(${siteName}, ${year})`
        full = `${author || siteName} (${year}) ${data.title}. Available at: ${data.url} (Accessed: ${data.accessDate}).`
        bibliography = `${author || siteName} (${year}) ${data.title}. [Online]. Available at: ${data.url} (Accessed: ${data.accessDate}).`
        break

      case 'ieee':
        inText = `[1]`
        full = `[1] ${author || siteName}, "${data.title}," ${siteName}, ${data.publishDate || 'n.d.'}. [Online]. Available: ${data.url}`
        bibliography = `[1] ${author || siteName}, "${data.title}," ${siteName}, ${data.publishDate || 'n.d.'}. [Online]. Available: ${data.url} [Accessed: ${data.accessDate}]`
        break

      case 'vancouver':
        inText = `[1]`
        full = `${author || siteName}. ${data.title} [Internet]. ${siteName}; ${data.publishDate || 'cited ' + data.accessDate} [cited ${data.accessDate}]. Available from: ${data.url}`
        bibliography = `${author || siteName}. ${data.title} [Internet]. ${siteName}; ${data.publishDate || 'cited ' + data.accessDate} [cited ${data.accessDate}]. Available from: ${data.url}`
        break
    }

    return {
      style,
      inText,
      full,
      bibliography,
    }
  }

  const citeCurrentPage = async (style: CitationStyle): Promise<GeneratedCitation | null> => {
    const data = await extractPageData()
    if (!data) return null

    const citation = generateCitation(data, style)
    currentCitation.value = citation
    
    citationHistory.value.unshift(citation)
    if (citationHistory.value.length > 50) {
      citationHistory.value = citationHistory.value.slice(0, 50)
    }
    await saveHistory()

    return citation
  }

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      return false
    }
  }

  const clearHistory = async () => {
    citationHistory.value = []
    await browser.storage.local.remove(STORAGE_KEY)
  }

  // Initialize
  loadHistory()

  return {
    citationHistory,
    currentCitation,
    styleOptions,
    generateCitation,
    citeCurrentPage,
    copyToClipboard,
    clearHistory,
    loadHistory,
    saveHistory,
  }
}
