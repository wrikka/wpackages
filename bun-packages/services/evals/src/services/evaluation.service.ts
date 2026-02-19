import type { EvaluationInput, EvaluationResult, EvaluationConfig, MetricCalculator } from '../types'
import { AccuracyCalculator, SimilarityCalculator, JaccardSimilarityCalculator, RelevanceCalculator } from '../lib'

export class EvaluationService {
  private calculators: Map<string, MetricCalculator> = new Map()

  constructor() {
    this.registerDefaultCalculators()
  }

  private registerDefaultCalculators(): void {
    this.registerCalculator(new AccuracyCalculator())
    this.registerCalculator(new SimilarityCalculator())
    this.registerCalculator(new JaccardSimilarityCalculator())
    this.registerCalculator(new RelevanceCalculator())
  }

  registerCalculator(calculator: MetricCalculator): void {
    this.calculators.set(calculator.name, calculator)
  }

  async evaluate(input: EvaluationInput, config: EvaluationConfig): Promise<EvaluationResult> {
    const metrics: Record<string, number> = {}
    const metricResults: Array<{ name: string; value: number }> = []

    for (const metricName of config.metrics) {
      const calculator = this.calculators.get(metricName)
      if (!calculator) {
        throw new Error(`Unknown metric: ${metricName}`)
      }

      const result = await calculator.calculate(input)
      metrics[metricName] = result.value
      metricResults.push({ name: result.name, value: result.value })
    }

    const score = this.calculateOverallScore(metricResults, config.weights)

    return {
      id: this.generateId(),
      input: input.input,
      output: input.output,
      expected: input.expected,
      score,
      metrics,
      timestamp: new Date(),
      model: input.model,
      evaluationType: config.metrics.join('+')
    }
  }

  async evaluateBatch(inputs: EvaluationInput[], config: EvaluationConfig): Promise<EvaluationResult[]> {
    const results: EvaluationResult[] = []

    for (const input of inputs) {
      try {
        const result = await this.evaluate(input, config)
        results.push(result)
      } catch (error) {
        console.error(`Failed to evaluate input: ${input.input}`, error)
      }
    }

    return results
  }

  getAvailableMetrics(): string[] {
    return Array.from(this.calculators.keys())
  }

  private calculateOverallScore(
    metricResults: Array<{ name: string; value: number }>,
    weights?: Record<string, number>
  ): number {
    if (metricResults.length === 0) return 0

    if (!weights) {
      return metricResults.reduce((sum, result) => sum + result.value, 0) / metricResults.length
    }

    let weightedSum = 0
    let totalWeight = 0

    for (const result of metricResults) {
      const weight = weights[result.name] || 1
      weightedSum += result.value * weight
      totalWeight += weight
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 0
  }

  private generateId(): string {
    return `eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}
