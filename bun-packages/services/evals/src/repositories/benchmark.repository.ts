import type { BenchmarkResult } from '../types'
import type { StorageAdapter, BenchmarkFilter } from '../types/storage-adapter.type'

export class BenchmarkRepository {
  constructor(private storageAdapter: StorageAdapter) {}

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
