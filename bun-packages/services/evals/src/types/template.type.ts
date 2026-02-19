export interface EvaluationTemplate {
  id: string
  name: string
  description: string
  category: TemplateCategory
  metrics: string[]
  weights?: Record<string, number>
  threshold?: number
  timeout?: number
  config?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export type TemplateCategory = 
  | 'qa'
  | 'summarization'
  | 'translation'
  | 'classification'
  | 'generation'
  | 'reasoning'
  | 'code'
  | 'custom'

export interface TemplateRegistry {
  templates: Map<string, EvaluationTemplate>
  categories: Map<TemplateCategory, string[]>
}

export interface TemplateUsage {
  templateId: string
  usageCount: number
  lastUsed: Date
  averageScore: number
}
