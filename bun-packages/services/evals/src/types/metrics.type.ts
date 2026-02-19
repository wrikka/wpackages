import type { MetricResult } from './evaluation-result.type'

export interface MetricDefinition {
  name: string
  description: string
  range: [number, number]
  higherIsBetter: boolean
}

export interface MetricsSummary {
  total: number
  average: number
  min: number
  max: number
  metrics: MetricResult[]
}

export type MetricType =
  | 'accuracy'
  | 'precision'
  | 'recall'
  | 'f1'
  | 'bleu'
  | 'rouge'
  | 'similarity'
  | 'relevance'
  | 'coherence'
  | 'custom'

// Re-export from evaluation-result.type to avoid circular dependencies
export type { MetricResult } from './evaluation-result.type'
