import type { ResponseBase, Language } from '../../common'

export interface GenerateRequest {
  prompt: string
  language: Language
  context?: string
  temperature?: number
  maxTokens?: number
}

export interface GenerateResponse extends ResponseBase {
  data: {
    code: string
    explanation: string
    confidence: number
    tokens: number
  }
}

export interface AIResult {
  code: string
  explanation: string
  confidence: number
  tokens: number
}
