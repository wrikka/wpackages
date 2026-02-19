import type { EvaluationResult, BenchmarkResult } from '../types'
import type { StorageAdapter, EvaluationFilter, BenchmarkFilter } from '../types/storage-adapter.type'

export type { StorageAdapter, EvaluationFilter, BenchmarkFilter } from '../types/storage-adapter.type'

export class InMemoryStorageAdapter implements StorageAdapter {
  private evaluationResults: Map<string, EvaluationResult> = new Map()
  private benchmarkResults: Map<string, BenchmarkResult> = new Map()

  async saveEvaluationResult(result: EvaluationResult): Promise<void> {
    this.evaluationResults.set(result.id, result)
  }

  async getEvaluationResult(id: string): Promise<EvaluationResult | null> {
    return this.evaluationResults.get(id) || null
  }

  async getEvaluationResults(filter?: EvaluationFilter): Promise<EvaluationResult[]> {
    let results = Array.from(this.evaluationResults.values())

    if (filter) {
      results = this.applyEvaluationFilter(results, filter)
    }

    results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    if (filter?.offset) {
      results = results.slice(filter.offset)
    }

    if (filter?.limit) {
      results = results.slice(0, filter.limit)
    }

    return results
  }

  async deleteEvaluationResult(id: string): Promise<boolean> {
    return this.evaluationResults.delete(id)
  }

  async saveBenchmarkResult(result: BenchmarkResult): Promise<void> {
    this.benchmarkResults.set(result.id, result)
  }

  async getBenchmarkResult(id: string): Promise<BenchmarkResult | null> {
    return this.benchmarkResults.get(id) || null
  }

  async getBenchmarkResults(filter?: BenchmarkFilter): Promise<BenchmarkResult[]> {
    let results = Array.from(this.benchmarkResults.values())

    if (filter) {
      results = this.applyBenchmarkFilter(results, filter)
    }

    results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    if (filter?.offset) {
      results = results.slice(filter.offset)
    }

    if (filter?.limit) {
      results = results.slice(0, filter.limit)
    }

    return results
  }

  async deleteBenchmarkResult(id: string): Promise<boolean> {
    return this.benchmarkResults.delete(id)
  }

  private applyEvaluationFilter(results: EvaluationResult[], filter: EvaluationFilter): EvaluationResult[] {
    return results.filter(result => {
      if (filter.model && result.model !== filter.model) return false
      if (filter.evaluationType && result.evaluationType !== filter.evaluationType) return false
      if (filter.dateFrom && result.timestamp < filter.dateFrom) return false
      if (filter.dateTo && result.timestamp > filter.dateTo) return false
      if (filter.minScore !== undefined && result.score < filter.minScore) return false
      if (filter.maxScore !== undefined && result.score > filter.maxScore) return false
      return true
    })
  }

  private applyBenchmarkFilter(results: BenchmarkResult[], filter: BenchmarkFilter): BenchmarkResult[] {
    return results.filter(result => {
      if (filter.benchmarkName && result.benchmarkName !== filter.benchmarkName) return false
      if (filter.model && result.model !== filter.model) return false
      if (filter.dataset && result.dataset !== filter.dataset) return false
      if (filter.dateFrom && result.timestamp < filter.dateFrom) return false
      if (filter.dateTo && result.timestamp > filter.dateTo) return false
      return true
    })
  }

  clear(): void {
    this.evaluationResults.clear()
    this.benchmarkResults.clear()
  }

  size(): { evaluations: number; benchmarks: number } {
    return {
      evaluations: this.evaluationResults.size,
      benchmarks: this.benchmarkResults.size
    }
  }
}

export class EvaluationRepository {
  constructor(private storageAdapter: StorageAdapter) { }

  async saveResult(result: EvaluationResult): Promise<void> {
    await this.storageAdapter.saveEvaluationResult(result)
  }

  async saveResults(results: EvaluationResult[]): Promise<void> {
    await Promise.all(results.map(result => this.saveResult(result)))
  }

  async getResult(id: string): Promise<EvaluationResult | null> {
    return await this.storageAdapter.getEvaluationResult(id)
  }

  async getResults(filter?: EvaluationFilter): Promise<EvaluationResult[]> {
    return await this.storageAdapter.getEvaluationResults(filter)
  }

  async getResultsByModel(model: string, limit?: number): Promise<EvaluationResult[]> {
    return await this.getResults({ model, limit })
  }

  async getResultsByType(evaluationType: string, limit?: number): Promise<EvaluationResult[]> {
    return await this.getResults({ evaluationType, limit })
  }

  async getResultsByDateRange(dateFrom: Date, dateTo: Date): Promise<EvaluationResult[]> {
    return await this.getResults({ dateFrom, dateTo })
  }

  async deleteResult(id: string): Promise<boolean> {
    return await this.storageAdapter.deleteEvaluationResult(id)
  }

  async getAverageScore(filter?: EvaluationFilter): Promise<number> {
    const results = await this.getResults(filter)
    if (results.length === 0) return 0
    return results.reduce((sum, result) => sum + result.score, 0) / results.length
  }

  async getTopResults(limit: number = 10, filter?: EvaluationFilter): Promise<EvaluationResult[]> {
    const results = await this.getResults(filter)
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  async getResultsCount(filter?: EvaluationFilter): Promise<number> {
    const results = await this.getResults(filter)
    return results.length
  }
}

export class BenchmarkRepository {
  constructor(private storageAdapter: StorageAdapter) { }

  async saveResult(result: BenchmarkResult): Promise<void> {
    await this.storageAdapter.saveBenchmarkResult(result)
  }

  async saveResults(results: BenchmarkResult[]): Promise<void> {
    await Promise.all(results.map(result => this.saveResult(result)))
  }

  async getResult(id: string): Promise<BenchmarkResult | null> {
    return await this.storageAdapter.getBenchmarkResult(id)
  }

  async getResults(filter?: BenchmarkFilter): Promise<BenchmarkResult[]> {
    return await this.storageAdapter.getBenchmarkResults(filter)
  }

  async getResultsByBenchmark(benchmarkName: string): Promise<BenchmarkResult[]> {
    return await this.getResults({ benchmarkName })
  }

  async getResultsByModel(model: string): Promise<BenchmarkResult[]> {
    return await this.getResults({ model })
  }

  async getResultsByDataset(dataset: string): Promise<BenchmarkResult[]> {
    return await this.getResults({ dataset })
  }

  async deleteResult(id: string): Promise<boolean> {
    return await this.storageAdapter.deleteBenchmarkResult(id)
  }

  async getAverageScore(benchmarkName?: string, model?: string): Promise<number> {
    const results = await this.getResults({ benchmarkName, model })
    if (results.length === 0) return 0
    return results.reduce((sum, result) => sum + result.summary.averageScore, 0) / results.length
  }

  async getResultsCount(filter?: BenchmarkFilter): Promise<number> {
    const results = await this.getResults(filter)
    return results.length
  }
}
