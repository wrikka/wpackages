import type { ResponseBase, Language, Priority } from '../../common'

export interface LearningRequest {
  code: string
  language: Language
  learningType: 'patterns' | 'best-practices' | 'anti-patterns' | 'optimizations' | 'architecture'
  options?: {
    context?: string
    projectType?: string
    experience?: 'beginner' | 'intermediate' | 'advanced'
    includeExamples?: boolean
  }
}

export interface LearningResponse extends ResponseBase {
  insights: {
    type: string
    title: string
    description: string
    confidence: number
    examples: string[]
  }[]
  patterns: {
    name: string
    category: 'design' | 'performance' | 'security' | 'maintainability'
    description: string
    frequency: number
    impact: 'low' | 'medium' | 'high'
    code: string
  }[]
  improvements: {
    type: string
    description: string
    before: string
    after: string
    benefit: string
  }[]
  recommendations: {
    priority: Priority
    title: string
    description: string
    resources: string[]
    actionItems: string[]
  }[]
}
