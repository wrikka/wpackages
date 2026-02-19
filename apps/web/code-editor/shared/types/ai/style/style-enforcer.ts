export interface AIStyleEnforcerRequest {
  code: string
  language: string
  styleType: 'comprehensive' | 'formatting' | 'naming' | 'structure' | 'best-practices'
  options?: {
    styleGuide?: string
    indentSize?: number
    indentType?: 'spaces' | 'tabs'
    maxLineLength?: number
    enforceNaming?: boolean
    autoFix?: boolean
  }
}

export interface AIStyleEnforcerResponse {
  success: boolean
  violations: {
    type: string
    severity: 'error' | 'warning' | 'info'
    message: string
    location: {
      line: number
      column: number
    }
    rule: string
    fix?: string
  }[]
  score: {
    overall: number
    categories: {
      formatting: number
      naming: number
      structure: number
      bestPractices: number
    }
  }
  fixes: {
    type: string
    description: string
    before: string
    after: string
    autoApplicable: boolean
  }[]
  formattedCode: string
}
