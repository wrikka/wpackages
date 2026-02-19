import type { EvaluationResult } from './evaluation-result.type'
import type { BenchmarkResult } from './benchmark.type'

export interface StorageAdapter {
  saveEvaluationResult(result: EvaluationResult): Promise<void>
  getEvaluationResult(id: string): Promise<EvaluationResult | null>
  getEvaluationResults(filter?: EvaluationFilter): Promise<EvaluationResult[]>
  deleteEvaluationResult(id: string): Promise<boolean>
  saveBenchmarkResult(result: BenchmarkResult): Promise<void>
  getBenchmarkResult(id: string): Promise<BenchmarkResult | null>
  getBenchmarkResults(filter?: BenchmarkFilter): Promise<BenchmarkResult[]>
  deleteBenchmarkResult(id: string): Promise<boolean>
}

export interface EvaluationFilter {
  model?: string
  evaluationType?: string
  dateFrom?: Date
  dateTo?: Date
  minScore?: number
  maxScore?: number
  limit?: number
  offset?: number
}

export interface BenchmarkFilter {
  benchmarkName?: string
  model?: string
  dataset?: string
  dateFrom?: Date
  dateTo?: Date
  limit?: number
  offset?: number
}
