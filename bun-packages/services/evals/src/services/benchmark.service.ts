import type {
  BenchmarkConfig,
  Dataset,
  BenchmarkResult,
  BenchmarkSummary,
  BenchmarkItem,
  EvaluationInput
} from '../types'
import { EvaluationService } from './evaluation.service'

export class BenchmarkService {
  private evaluationService: EvaluationService
  private datasets: Map<string, Dataset> = new Map()

  constructor() {
    this.evaluationService = new EvaluationService()
  }

  registerDataset(dataset: Dataset): void {
    this.datasets.set(dataset.name, dataset)
  }

  async runBenchmark(config: BenchmarkConfig): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = []

    for (const modelName of config.models) {
      for (const datasetName of config.datasets) {
        const dataset = this.datasets.get(datasetName)
        if (!dataset) {
          throw new Error(`Dataset not found: ${datasetName}`)
        }

        const result = await this.runModelBenchmark(modelName, dataset, config)
        results.push(result)
      }
    }

    return results
  }

  private async runModelBenchmark(
    model: string,
    dataset: Dataset,
    config: BenchmarkConfig
  ): Promise<BenchmarkResult> {
    const startTime = Date.now()

    const items = config.parallel
      ? await this.runParallel(dataset.items, model, config)
      : await this.runSequential(dataset.items, model, config)

    const endTime = Date.now()
    const summary = this.calculateSummary(items)

    return {
      id: this.generateBenchmarkId(),
      benchmarkName: config.name,
      model,
      dataset: dataset.name,
      results: items,
      summary,
      timestamp: new Date(),
      duration: endTime - startTime
    }
  }

  private async runSequential(
    items: BenchmarkItem[],
    model: string,
    config: BenchmarkConfig
  ): Promise<Array<{ itemId: string; evaluationResult: any; duration: number }>> {
    const results: Array<{ itemId: string; evaluationResult: any; duration: number }> = []

    for (const item of items) {
      const result = await this.evaluateItem(item, model, config)
      results.push(result)
    }

    return results
  }

  private async runParallel(
    items: BenchmarkItem[],
    model: string,
    config: BenchmarkConfig
  ): Promise<Array<{ itemId: string; evaluationResult: any; duration: number }>> {
    const maxConcurrency = config.maxConcurrency || 4
    const results: Array<{ itemId: string; evaluationResult: any; duration: number }> = []

    for (let i = 0; i < items.length; i += maxConcurrency) {
      const batch = items.slice(i, i + maxConcurrency)
      const batchPromises = batch.map(item => this.evaluateItem(item, model, config))
      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
    }

    return results
  }

  private async evaluateItem(
    item: BenchmarkItem,
    model: string,
    config: BenchmarkConfig
  ): Promise<{ itemId: string; evaluationResult: any; duration: number }> {
    const startTime = Date.now()

    const evaluationInput: EvaluationInput = {
      input: item.input,
      output: item.output || '',
      expected: item.expected,
      model,
      context: item.context
    }

    const evaluationResult = await this.evaluationService.evaluate(evaluationInput, {
      metrics: config.metrics,
      weights: config.weights,
      timeout: config.timeout
    })

    const duration = Date.now() - startTime

    return {
      itemId: item.id,
      evaluationResult,
      duration
    }
  }

  private calculateSummary(
    results: Array<{ itemId: string; evaluationResult: any; duration: number }>
  ): BenchmarkSummary {
    if (results.length === 0) {
      return {
        totalItems: 0,
        averageScore: 0,
        metrics: {},
        successRate: 0,
        averageDuration: 0,
        distribution: {}
      }
    }

    const scores = results.map(r => r.evaluationResult.score)
    const durations = results.map(r => r.duration)
    const metrics: Record<string, number> = {}

    for (const result of results) {
      for (const [metricName, value] of Object.entries(result.evaluationResult.metrics)) {
        if (!metrics[metricName]) {
          metrics[metricName] = 0
        }
        metrics[metricName] += value as number
      }
    }

    for (const metricName of Object.keys(metrics)) {
      metrics[metricName] = metrics[metricName] / results.length
    }

    const successCount = results.filter(r => r.evaluationResult.score > 0.5).length
    const distribution: Record<string, number> = {}

    for (const score of scores) {
      const bucket = Math.floor(score * 10) / 10
      const key = bucket.toString()
      distribution[key] = (distribution[key] || 0) + 1
    }

    return {
      totalItems: results.length,
      averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
      metrics,
      successRate: successCount / results.length,
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      distribution
    }
  }

  getAvailableDatasets(): string[] {
    return Array.from(this.datasets.keys())
  }

  getDataset(name: string): Dataset | undefined {
    return this.datasets.get(name)
  }

  private generateBenchmarkId(): string {
    return `bench_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}
