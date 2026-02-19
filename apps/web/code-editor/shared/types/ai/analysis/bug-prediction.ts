export interface BugPredictionRequest {
  code: string
  language: string
  predictionType: 'comprehensive' | 'security' | 'performance' | 'logic' | 'syntax'
  options?: {
    severity?: 'all' | 'high' | 'medium' | 'low'
    includeSuggestions?: boolean
    confidence?: number
  }
}

export interface BugPredictionResponse {
  success: boolean
  predictions: {
    type: string
    severity: 'critical' | 'high' | 'medium' | 'low'
    confidence: number
    description: string
    location: {
      line: number
      column: number
    }
    code: string
    fix: string
    examples: string[]
  }[]
  riskScore: {
    overall: number
    categories: {
      security: number
      performance: number
      logic: number
      syntax: number
      maintainability: number
    }
  }
  recommendations: {
    priority: 'high' | 'medium' | 'low'
    title: string
    description: string
    actions: string[]
  }[]
  metrics: {
    totalPredictions: number
    criticalCount: number
    highCount: number
    mediumCount: number
    lowCount: number
    averageConfidence: number
  }
}
