import type { ResponseBase, Language, Severity, Priority } from '../../common'

export interface CodeReviewRequest {
  code: string
  language: Language
  reviewType: 'comprehensive' | 'security' | 'performance' | 'style' | 'best-practices'
  options?: {
    strictness?: 'low' | 'medium' | 'high'
    includeSuggestions?: boolean
    checkStyle?: boolean
    checkSecurity?: boolean
    checkPerformance?: boolean
  }
}

export interface CodeReviewResponse extends ResponseBase {
  review: {
    summary: string
    details: {
      category: string
      score: number
      findings: string[]
    }[]
  }
  score: {
    overall: number
    categories: {
      style: number
      security: number
      performance: number
      maintainability: number
      best_practices: number
    }
  }
  issues: {
    type: string
    severity: Severity
    message: string
    line?: number
    column?: number
    suggestion?: string
  }[]
  suggestions: {
    type: string
    message: string
    code: string
    impact: 'low' | 'medium' | 'high'
  }[]
  approval: {
    approved: boolean
    confidence: number
    requirements: string[]
  }
}
