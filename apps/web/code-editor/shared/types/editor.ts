export interface EditorConfig {
  language: string
  theme: 'vs-dark' | 'vs-light'
  fontSize: number
  wordWrap: boolean
  minimap: boolean
  lineNumbers: boolean
}

export interface EditorPosition {
  line: number
  column: number
}

export interface EditorAction {
  type: 'save' | 'run' | 'format' | 'find'
  payload?: any
}
