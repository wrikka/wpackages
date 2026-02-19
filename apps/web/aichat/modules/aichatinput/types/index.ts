export interface ChatInputProps {
  mode?: string
  model?: string
  value?: string
  disabled?: boolean
}

export interface ChatInputEmits {
  send: [payload: { message: string, files: File[], mode: string, model: string, systemPrompt?: string | null }]
  stop: []
  'update:mode': [mode: string]
  'update:model': [model: string]
  'update:value': [value: string]
}

export interface ChatInputState {
  message: string
  isLoading: boolean
  isDisabled: boolean
  files: File[]
}

export interface ContextSuggestion {
  id: string
  text: string
  type: string
}

export interface MenuItem {
  id: string
  label: string
  insert: string
  type?: string
}

// Export additional types
export * from './template'
export * from './chat'
export * from './input'
