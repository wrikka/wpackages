export const DEFAULT_EVALUATION_TIMEOUT = 30000
export const DEFAULT_BENCHMARK_TIMEOUT = 60000
export const DEFAULT_MAX_CONCURRENCY = 4

export const METRIC_DEFINITIONS = {
  accuracy: {
    name: 'accuracy',
    description: 'Exact match accuracy between expected and actual output',
    range: [0, 1] as [number, number],
    higherIsBetter: true
  },
  similarity: {
    name: 'similarity',
    description: 'Levenshtein string similarity',
    range: [0, 1] as [number, number],
    higherIsBetter: true
  },
  jaccard_similarity: {
    name: 'jaccard_similarity',
    description: 'Jaccard token similarity',
    range: [0, 1] as [number, number],
    higherIsBetter: true
  },
  relevance: {
    name: 'relevance',
    description: 'Keyword relevance score',
    range: [0, 1] as [number, number],
    higherIsBetter: true
  }
} as const

export const TEMPLATE_CATEGORIES = [
  'qa',
  'summarization',
  'translation',
  'classification',
  'generation',
  'reasoning',
  'code',
  'custom'
] as const

export const DEFAULT_WEIGHTS = {
  accuracy: 0.5,
  similarity: 0.3,
  relevance: 0.2
}
