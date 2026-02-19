import type { EvaluationInput, MetricResult, MetricCalculator } from '../types'
import { calculateSimilarity, calculateJaccardSimilarity } from '../utils'

export class AccuracyCalculator implements MetricCalculator {
  name = 'accuracy'

  async calculate(input: EvaluationInput): Promise<MetricResult> {
    if (!input.expected) {
      throw new Error('Expected value is required for accuracy calculation')
    }

    const isCorrect = input.output.trim().toLowerCase() === input.expected.trim().toLowerCase()
    const value = isCorrect ? 1 : 0

    return {
      name: 'accuracy',
      value,
      normalized: value,
      description: 'Exact match accuracy'
    }
  }
}

export class SimilarityCalculator implements MetricCalculator {
  name = 'similarity'

  async calculate(input: EvaluationInput): Promise<MetricResult> {
    if (!input.expected) {
      throw new Error('Expected value is required for similarity calculation')
    }

    const similarity = calculateSimilarity(input.output, input.expected)

    return {
      name: 'similarity',
      value: similarity,
      normalized: similarity,
      description: 'Levenshtein string similarity'
    }
  }
}

export class JaccardSimilarityCalculator implements MetricCalculator {
  name = 'jaccard_similarity'

  async calculate(input: EvaluationInput): Promise<MetricResult> {
    if (!input.expected) {
      throw new Error('Expected value is required for Jaccard similarity calculation')
    }

    const similarity = calculateJaccardSimilarity(input.output, input.expected)

    return {
      name: 'jaccard_similarity',
      value: similarity,
      normalized: similarity,
      description: 'Jaccard token similarity'
    }
  }
}

export class RelevanceCalculator implements MetricCalculator {
  name = 'relevance'

  async calculate(input: EvaluationInput): Promise<MetricResult> {
    const keywords = this.extractKeywords(input.input)
    const outputTokens = new Set(input.output.toLowerCase().split(/\s+/))

    let matches = 0
    for (const keyword of keywords) {
      if (outputTokens.has(keyword.toLowerCase())) {
        matches++
      }
    }

    const value = keywords.length > 0 ? matches / keywords.length : 0

    return {
      name: 'relevance',
      value,
      normalized: value,
      description: 'Keyword relevance score'
    }
  }

  private extractKeywords(text: string): string[] {
    return text.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['that', 'this', 'with', 'from', 'they', 'have', 'been'].includes(word))
  }
}
