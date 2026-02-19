export interface AutocompleteRequest {
  code: string
  language: string
  position: {
    line: number
    column: number
  }
  context?: string
  options?: {
    maxResults?: number
    includeTypes?: boolean
    includeDocumentation?: boolean
    fuzzy?: boolean
  }
}

export interface AutocompleteResponse {
  success: boolean
  completions: {
    text: string
    type: 'keyword' | 'function' | 'variable' | 'class' | 'method' | 'property' | 'snippet'
    description?: string
    documentation?: string
    insertText?: string
    priority: number
  }[]
  context: {
    scope: string
    variables: string[]
    functions: string[]
    imports: string[]
  }
  suggestions: {
    type: string
    message: string
    code?: string
  }[]
}
