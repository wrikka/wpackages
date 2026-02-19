import type { ResponseBase, Language } from '../../common'

export interface AnalysisRequest {
  code: string
  language: Language
  analysisType: 'quality' | 'security' | 'performance'
}

export interface AnalysisResponse extends ResponseBase {
  metrics: {
    quality: number
    security: number
    performance: number
    maintainability: number
  }
  issues: {
    type: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    message: string
    line?: number
  }[]
  suggestions: string[]
}
