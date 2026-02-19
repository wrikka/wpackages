import type { 
  EvaluationTemplate, 
  TemplateCategory, 
  TemplateRegistry, 
  TemplateUsage,
  EvaluationConfig 
} from '../types'

export class TemplateService {
  private registry: TemplateRegistry = {
    templates: new Map(),
    categories: new Map()
  }

  constructor() {
    this.initializeDefaultTemplates()
  }

  private initializeDefaultTemplates(): void {
    const defaultTemplates: EvaluationTemplate[] = [
      {
        id: 'qa-basic',
        name: 'Basic Q&A Evaluation',
        description: 'Template for evaluating question-answering tasks',
        category: 'qa',
        metrics: ['accuracy', 'similarity'],
        weights: { accuracy: 0.7, similarity: 0.3 },
        threshold: 0.7,
        timeout: 30000,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'summarization-comprehensive',
        name: 'Comprehensive Summarization',
        description: 'Template for evaluating text summarization quality',
        category: 'summarization',
        metrics: ['similarity', 'relevance', 'jaccard_similarity'],
        weights: { similarity: 0.4, relevance: 0.4, jaccard_similarity: 0.2 },
        threshold: 0.6,
        timeout: 60000,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'translation-quality',
        name: 'Translation Quality',
        description: 'Template for evaluating translation accuracy and fluency',
        category: 'translation',
        metrics: ['accuracy', 'similarity'],
        weights: { accuracy: 0.6, similarity: 0.4 },
        threshold: 0.7,
        timeout: 45000,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'classification-accuracy',
        name: 'Classification Accuracy',
        description: 'Template for evaluating classification tasks',
        category: 'classification',
        metrics: ['accuracy'],
        weights: { accuracy: 1.0 },
        threshold: 0.8,
        timeout: 15000,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'generation-quality',
        name: 'Content Generation Quality',
        description: 'Template for evaluating creative content generation',
        category: 'generation',
        metrics: ['relevance', 'similarity'],
        weights: { relevance: 0.6, similarity: 0.4 },
        threshold: 0.5,
        timeout: 90000,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'reasoning-evaluation',
        name: 'Reasoning Evaluation',
        description: 'Template for evaluating logical reasoning tasks',
        category: 'reasoning',
        metrics: ['accuracy', 'relevance'],
        weights: { accuracy: 0.8, relevance: 0.2 },
        threshold: 0.75,
        timeout: 120000,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'code-evaluation',
        name: 'Code Evaluation',
        description: 'Template for evaluating code generation and correctness',
        category: 'code',
        metrics: ['accuracy', 'similarity'],
        weights: { accuracy: 0.9, similarity: 0.1 },
        threshold: 0.8,
        timeout: 180000,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    for (const template of defaultTemplates) {
      this.registerTemplate(template)
    }
  }

  registerTemplate(template: EvaluationTemplate): void {
    this.registry.templates.set(template.id, template)

    if (!this.registry.categories.has(template.category)) {
      this.registry.categories.set(template.category, [])
    }
    
    const categoryTemplates = this.registry.categories.get(template.category)!
    if (!categoryTemplates.includes(template.id)) {
      categoryTemplates.push(template.id)
    }
  }

  getTemplate(id: string): EvaluationTemplate | undefined {
    return this.registry.templates.get(id)
  }

  getTemplatesByCategory(category: TemplateCategory): EvaluationTemplate[] {
    const templateIds = this.registry.categories.get(category) || []
    return templateIds
      .map(id => this.registry.templates.get(id))
      .filter((template): template is EvaluationTemplate => template !== undefined)
  }

  getAllTemplates(): EvaluationTemplate[] {
    return Array.from(this.registry.templates.values())
  }

  getCategories(): TemplateCategory[] {
    return Array.from(this.registry.categories.keys())
  }

  updateTemplate(id: string, updates: Partial<EvaluationTemplate>): boolean {
    const template = this.registry.templates.get(id)
    if (!template) return false

    const updatedTemplate = {
      ...template,
      ...updates,
      id: template.id,
      updatedAt: new Date()
    }

    this.registry.templates.set(id, updatedTemplate)
    return true
  }

  deleteTemplate(id: string): boolean {
    const template = this.registry.templates.get(id)
    if (!template) return false

    this.registry.templates.delete(id)

    const categoryTemplates = this.registry.categories.get(template.category)
    if (categoryTemplates) {
      const index = categoryTemplates.indexOf(id)
      if (index > -1) {
        categoryTemplates.splice(index, 1)
      }
    }

    return true
  }

  createEvaluationConfig(templateId: string): EvaluationConfig | null {
    const template = this.getTemplate(templateId)
    if (!template) return null

    return {
      metrics: template.metrics,
      weights: template.weights,
      threshold: template.threshold,
      timeout: template.timeout
    }
  }

  searchTemplates(query: string): EvaluationTemplate[] {
    const lowerQuery = query.toLowerCase()
    return this.getAllTemplates().filter(template =>
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery) ||
      template.category.toLowerCase().includes(lowerQuery)
    )
  }

  validateTemplate(template: Partial<EvaluationTemplate>): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!template.name || template.name.trim().length === 0) {
      errors.push('Template name is required')
    }

    if (!template.description || template.description.trim().length === 0) {
      errors.push('Template description is required')
    }

    if (!template.category) {
      errors.push('Template category is required')
    }

    if (!template.metrics || template.metrics.length === 0) {
      errors.push('At least one metric is required')
    }

    if (template.weights) {
      const totalWeight = Object.values(template.weights).reduce((a, b) => a + b, 0)
      if (Math.abs(totalWeight - 1.0) > 0.01) {
        errors.push('Weights must sum to 1.0')
      }
    }

    if (template.threshold !== undefined && (template.threshold < 0 || template.threshold > 1)) {
      errors.push('Threshold must be between 0 and 1')
    }

    if (template.timeout !== undefined && template.timeout <= 0) {
      errors.push('Timeout must be positive')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  cloneTemplate(id: string, newName: string): EvaluationTemplate | null {
    const original = this.getTemplate(id)
    if (!original) return null

    const cloned: EvaluationTemplate = {
      ...original,
      id: this.generateTemplateId(),
      name: newName,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.registerTemplate(cloned)
    return cloned
  }

  getTemplateUsageStats(): TemplateUsage[] {
    return Array.from(this.registry.templates.values()).map(template => ({
      templateId: template.id,
      usageCount: 0,
      lastUsed: new Date(0),
      averageScore: 0
    }))
  }

  private generateTemplateId(): string {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}
