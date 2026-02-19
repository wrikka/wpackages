export interface EvaluationResult {
  id: string
  input: string
  output: string
  expected?: string
  score: number
  metrics: Record<string, number>
  timestamp: Date
  model?: string
  evaluationType: string
}

export interface EvaluationConfig {
  metrics: string[]
  weights?: Record<string, number>
  threshold?: number
  timeout?: number
}

export interface EvaluationInput {
  input: string
  output: string
  expected?: string
  model?: string
  context?: Record<string, any>
}

export interface MetricResult {
  name: string
  value: number
  normalized: number
  description?: string
}

export interface MetricCalculator {
  name: string
  calculate(input: EvaluationInput): Promise<MetricResult>
}
