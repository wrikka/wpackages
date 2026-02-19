export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

export interface Bookmark {
  id: string
  title: string
  url: string
  timestamp: number
  createdAt: number
  updatedAt: number
  tags?: string[]
  notes?: string
}

export interface Note {
  id: string
  title: string
  content: string
  url?: string
  createdAt: number
  updatedAt: number
  tags?: string[]
}

export interface CustomPrompt {
  id: string
  name: string
  template: string
  createdAt: number
}

export interface RecordedAction {
  type: string
  selector?: string
  value?: string
  timestamp: number
}

export type SummaryLength = 'short' | 'medium' | 'long'

export type HistoryFilter = 'all' | 'chat' | 'summary' | 'bookmark' | 'note' | 'workflow'

export interface HistoryItem {
  id: string
  type: 'chat' | 'summary' | 'bookmark' | 'note' | 'workflow'
  title?: string
  url?: string
  content?: string
  timestamp: number
  metadata?: Record<string, unknown>
}

export interface PageContent {
  url: string
  title: string
  text: string
  links: Array<{ text: string; href: string }>
  images: Array<{ src: string; alt: string }>
  forms: Array<{
    action: string
    method: string
    inputs: Array<{ name: string; type: string; placeholder: string }>
  }>
}

export interface ExtensionSettings {
  enabled: boolean
  autoStart: boolean
  theme: 'light' | 'dark' | 'system'
}

export interface MoodEntry {
  id: string
  timestamp: number
  mood: 'happy' | 'neutral' | 'sad' | 'excited' | 'tired' | 'focused'
  note?: string
  url?: string
  title?: string
}

export type CitationStyle = 'apa' | 'mla' | 'chicago' | 'harvard' | 'ieee' | 'vancouver'

export interface QuickAction {
  id: string
  title: string
  description: string
  icon: any
  action: () => void
  shortcut?: string
}
