import type { ResponseBase, Language } from '../../common'

export interface OptimizeRequest {
  code: string
  language: Language
  optimizationType: 'performance' | 'memory' | 'speed' | 'size'
  options?: {
    preserveReadability?: boolean
    aggressive?: boolean
    targetEnvironment?: 'browser' | 'node' | 'mobile'
  }
}

export interface OptimizeResponse extends ResponseBase {
  originalCode: string
  optimizedCode: string
  improvements: {
    type: string
    description: string
    impact: 'low' | 'medium' | 'high'
    estimatedGain: string
  }[]
  metrics: {
    performance: number
    memory: number
    speed: number
    size: number
  }
  benchmarks: {
    original: number
    optimized: number
    improvement: number
    unit: string
  }[]
}
