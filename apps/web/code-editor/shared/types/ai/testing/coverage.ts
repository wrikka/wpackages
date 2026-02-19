export interface AICoverageRequest {
  code: string
  language: string
  analysisType: 'comprehensive' | 'unit' | 'integration' | 'e2e' | 'coverage'
  options?: {
    includeTests?: boolean
    threshold?: number
    framework?: string
    detailed?: boolean
  }
}

export interface AICoverageResponse {
  success: boolean
  coverage: {
    overall: number
    lines: {
      covered: number
      total: number
      percentage: number
    }
    functions: {
      covered: number
      total: number
      percentage: number
    }
    branches: {
      covered: number
      total: number
      percentage: number
    }
    statements: {
      covered: number
      total: number
      percentage: number
    }
  }
  gaps: {
    type: 'function' | 'branch' | 'line' | 'edge-case'
    severity: 'critical' | 'high' | 'medium' | 'low'
    description: string
    location: {
      file: string
      line: number
      column: number
    }
    suggestion: string
    code: string
  }[]
  recommendations: {
    priority: 'high' | 'medium' | 'low'
    title: string
    description: string
    actions: string[]
    examples: string[]
  }[]
  metrics: {
    totalTests: number
    passingTests: number
    failingTests: number
    coverageScore: number
    qualityScore: number
    maintainabilityIndex: number
  }
}
