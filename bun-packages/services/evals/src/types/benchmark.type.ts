export interface BenchmarkConfig {
  name: string
  description?: string
  models: string[]
  datasets: string[]
  metrics: string[]
  weights?: Record<string, number>
  timeout?: number
  parallel?: boolean
  maxConcurrency?: number
}

export interface Dataset {
  name: string
  description?: string
  items: BenchmarkItem[]
}

export interface BenchmarkItem {
  id: string
  input: string
  expected?: string
  output?: string
  context?: Record<string, any>
  category?: string
  difficulty?: 'easy' | 'medium' | 'hard'
}

export interface BenchmarkResult {
  id: string
  benchmarkName: string
  model: string
  dataset: string
  results: Array<{
    itemId: string
    evaluationResult: any
    duration: number
  }>
  summary: BenchmarkSummary
  timestamp: Date
  duration: number
}

export interface BenchmarkSummary {
  totalItems: number
  averageScore: number
  metrics: Record<string, number>
  successRate: number
  averageDuration: number
  distribution: Record<string, number>
}
