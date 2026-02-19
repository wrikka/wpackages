import { ref, computed } from 'vue'
import type { Bookmark, Note, ChatMessage, CustomPrompt, MoodEntry, HistoryItem } from '@/types'

export type ExportFormat = 'json' | 'markdown' | 'csv' | 'txt'
export type ExportDataType = 'all' | 'bookmarks' | 'notes' | 'chat' | 'prompts' | 'mood' | 'history'

export interface ExportOptions {
  format: ExportFormat
  dataTypes: ExportDataType[]
  dateRange?: { start: number; end: number }
  includeMetadata: boolean
}

export function useExportData() {
  const isExporting = ref(false)
  const lastExport = ref<string | null>(null)

  const collectData = async (options: ExportOptions) => {
    const data: Record<string, unknown> = {}
    const typesToExport = options.dataTypes.includes('all')
      ? ['bookmarks', 'notes', 'chatMessages', 'customPrompts', 'moodEntries', 'sessionHistory']
      : options.dataTypes

    for (const type of typesToExport) {
      switch (type) {
        case 'bookmarks': {
          const stored = await browser.storage.local.get('bookmarks')
          data.bookmarks = stored.bookmarks || []
          break
        }
        case 'notes': {
          const stored = await browser.storage.local.get('notes')
          data.notes = stored.notes || []
          break
        }
        case 'chat':
        case 'chatMessages': {
          const stored = await browser.storage.local.get('chatMessages')
          data.chatMessages = stored.chatMessages || []
          break
        }
        case 'prompts':
        case 'customPrompts': {
          const stored = await browser.storage.local.get('customPrompts')
          data.customPrompts = stored.customPrompts || []
          break
        }
        case 'mood':
        case 'moodEntries': {
          const stored = await browser.storage.local.get('moodEntries')
          data.moodEntries = stored.moodEntries || []
          break
        }
        case 'history':
        case 'sessionHistory': {
          const stored = await browser.storage.local.get('sessionHistory')
          data.sessionHistory = stored.sessionHistory || []
          break
        }
      }
    }

    // Filter by date range if specified
    if (options.dateRange) {
      for (const key of Object.keys(data)) {
        const items = data[key] as Array<{ timestamp?: number }>
        if (Array.isArray(items)) {
          data[key] = items.filter(item =>
            item.timestamp &&
            item.timestamp >= options.dateRange!.start &&
            item.timestamp <= options.dateRange!.end
          )
        }
      }
    }

    if (options.includeMetadata) {
      data.metadata = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        extension: 'wai-browser-agent',
      }
    }

    return data
  }

  const formatAsJSON = (data: unknown): string => {
    return JSON.stringify(data, null, 2)
  }

  const formatAsMarkdown = (data: Record<string, unknown>): string => {
    let md = '# Wai Browser Agent Export\n\n'
    md += `Exported: ${new Date().toLocaleString()}\n\n`

    if (data.bookmarks) {
      md += '## Bookmarks\n\n'
      for (const bookmark of data.bookmarks as Bookmark[]) {
        md += `- [${bookmark.title}](${bookmark.url}) - ${new Date(bookmark.createdAt).toLocaleDateString()}\n`
      }
      md += '\n'
    }

    if (data.notes) {
      md += '## Notes\n\n'
      for (const note of data.notes as Note[]) {
        md += `### ${note.title || 'Untitled'}\n`
        md += `_Created: ${new Date(note.createdAt).toLocaleString()}_\n\n`
        md += `${note.content}\n\n`
      }
    }

    if (data.chatMessages) {
      md += '## Chat History\n\n'
      for (const msg of data.chatMessages as ChatMessage[]) {
        md += `**${msg.role === 'user' ? 'You' : 'AI'}** (${new Date(msg.timestamp).toLocaleString()}):\n`
        md += `${msg.content}\n\n`
      }
    }

    return md
  }

  const formatAsCSV = (data: Record<string, unknown>, type: string): string => {
    let csv = ''

    switch (type) {
      case 'bookmarks': {
        csv = 'Title,URL,Tags,CreatedAt\n'
        for (const item of (data.bookmarks as Bookmark[]) || []) {
          csv += `"${item.title}","${item.url}","${(item.tags || []).join(';')}","${new Date(item.createdAt).toISOString()}"\n`
        }
        break
      }
      case 'notes': {
        csv = 'Title,Content,CreatedAt,UpdatedAt\n'
        for (const item of (data.notes as Note[]) || []) {
          csv += `"${item.title}","${item.content.replace(/"/g, '""')}","${new Date(item.createdAt).toISOString()}","${new Date(item.updatedAt).toISOString()}"\n`
        }
        break
      }
      case 'mood': {
        csv = 'Timestamp,Mood,Note,URL,Title\n'
        for (const item of (data.moodEntries as MoodEntry[]) || []) {
          csv += `"${new Date(item.timestamp).toISOString()}","${item.mood}","${(item.note || '').replace(/"/g, '""')}","${item.url || ''}","${item.title || ''}"\n`
        }
        break
      }
      default: {
        csv = 'Type,Data\n'
        csv += `"${type}","${JSON.stringify(data).replace(/"/g, '""')}"\n`
      }
    }

    return csv
  }

  const formatAsTXT = (data: Record<string, unknown>): string => {
    let txt = `Wai Browser Agent Export\n`
    txt += `Date: ${new Date().toLocaleString()}\n`
    txt += `${'='.repeat(50)}\n\n`

    for (const [key, value] of Object.entries(data)) {
      if (key === 'metadata') continue
      txt += `${key.toUpperCase()}\n`
      txt += `${'-'.repeat(30)}\n`
      txt += JSON.stringify(value, null, 2)
      txt += '\n\n'
    }

    return txt
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    lastExport.value = filename
  }

  const exportData = async (options: ExportOptions) => {
    isExporting.value = true
    try {
      const data = await collectData(options)
      const timestamp = new Date().toISOString().split('T')[0]

      let content: string
      let filename: string
      let mimeType: string

      switch (options.format) {
        case 'json':
          content = formatAsJSON(data)
          filename = `wai-export-${timestamp}.json`
          mimeType = 'application/json'
          break
        case 'markdown':
          content = formatAsMarkdown(data)
          filename = `wai-export-${timestamp}.md`
          mimeType = 'text/markdown'
          break
        case 'csv':
          content = formatAsCSV(data, options.dataTypes[0] || 'all')
          filename = `wai-export-${timestamp}.csv`
          mimeType = 'text/csv'
          break
        case 'txt':
          content = formatAsTXT(data)
          filename = `wai-export-${timestamp}.txt`
          mimeType = 'text/plain'
          break
        default:
          throw new Error(`Unsupported format: ${options.format}`)
      }

      downloadFile(content, filename, mimeType)
      return true
    } catch (error) {
      console.error('Export failed:', error)
      return false
    } finally {
      isExporting.value = false
    }
  }

  return {
    isExporting,
    lastExport,
    exportData,
    collectData,
  }
}
