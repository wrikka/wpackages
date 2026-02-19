import type { EvaluationResult, MetricsSummary, MetricResult } from '../types'

export interface MetricsFilter {
  model?: string
  evaluationType?: string
  dateFrom?: Date
  dateTo?: Date
  minScore?: number
  maxScore?: number
}

export interface MetricsAggregation {
  by: 'model' | 'evaluationType' | 'date' | 'custom'
  groupBy?: string
  aggregation: 'avg' | 'sum' | 'min' | 'max' | 'count'
}

export class MetricsCollectionService {
  private results: EvaluationResult[] = []

  addResult(result: EvaluationResult): void {
    this.results.push(result)
  }

  addResults(results: EvaluationResult[]): void {
    this.results.push(...results)
  }

  getResults(filter?: MetricsFilter): EvaluationResult[] {
    if (!filter) return this.results

    return this.results.filter(result => {
      if (filter.model && result.model !== filter.model) return false
      if (filter.evaluationType && result.evaluationType !== filter.evaluationType) return false
      if (filter.dateFrom && result.timestamp < filter.dateFrom) return false
      if (filter.dateTo && result.timestamp > filter.dateTo) return false
      if (filter.minScore !== undefined && result.score < filter.minScore) return false
      if (filter.maxScore !== undefined && result.score > filter.maxScore) return false
      return true
    })
  }

  getMetricsSummary(filter?: MetricsFilter): MetricsSummary {
    const results = this.getResults(filter)

    if (results.length === 0) {
      return {
        total: 0,
        average: 0,
        min: 0,
        max: 0,
        metrics: []
      }
    }

    const scores = results.map(r => r.score)
    const allMetrics: Map<string, number[]> = new Map()

    for (const result of results) {
      for (const [metricName, value] of Object.entries(result.metrics)) {
        if (!allMetrics.has(metricName)) {
          allMetrics.set(metricName, [])
        }
        allMetrics.get(metricName)!.push(value as number)
      }
    }

    const metricResults: MetricResult[] = []

    for (const [metricName, values] of allMetrics) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length

      metricResults.push({
        name: metricName,
        value: avg,
        normalized: avg,
        description: `Average ${metricName} across ${values.length} evaluations`
      })
    }

    return {
      total: results.length,
      average: scores.reduce((a, b) => a + b, 0) / scores.length,
      min: Math.min(...scores),
      max: Math.max(...scores),
      metrics: metricResults
    }
  }

  aggregateMetrics(
    aggregation: MetricsAggregation,
    filter?: MetricsFilter
  ): Record<string, number> {
    const results = this.getResults(filter)
    const groups: Map<string, number[]> = new Map()

    for (const result of results) {
      let groupKey: string

      switch (aggregation.by) {
        case 'model':
          groupKey = result.model || 'unknown'
          break
        case 'evaluationType':
          groupKey = result.evaluationType
          break
        case 'date':
          groupKey = result.timestamp.toISOString().split('T')[0]
          break
        case 'custom':
          groupKey = aggregation.groupBy || 'default'
          break
        default:
          groupKey = 'default'
      }

      if (!groups.has(groupKey)) {
        groups.set(groupKey, [])
      }
      groups.get(groupKey)!.push(result.score)
    }

    const aggregated: Record<string, number> = {}

    for (const [groupKey, values] of groups) {
      switch (aggregation.aggregation) {
        case 'avg':
          aggregated[groupKey] = values.reduce((a, b) => a + b, 0) / values.length
          break
        case 'sum':
          aggregated[groupKey] = values.reduce((a, b) => a + b, 0)
          break
        case 'min':
          aggregated[groupKey] = Math.min(...values)
          break
        case 'max':
          aggregated[groupKey] = Math.max(...values)
          break
        case 'count':
          aggregated[groupKey] = values.length
          break
      }
    }

    return aggregated
  }

  getTimeSeriesData(
    metric: string,
    interval: 'hour' | 'day' | 'week' | 'month',
    filter?: MetricsFilter
  ): Array<{ timestamp: Date; value: number }> {
    const results = this.getResults(filter)
    const timeSeries: Map<string, number[]> = new Map()

    for (const result of results) {
      let timeKey: string

      switch (interval) {
        case 'hour':
          timeKey = new Date(result.timestamp).toISOString().slice(0, 13) + ':00'
          break
        case 'day':
          timeKey = result.timestamp.toISOString().split('T')[0]
          break
        case 'week':
          const weekStart = new Date(result.timestamp)
          weekStart.setDate(weekStart.getDate() - weekStart.getDay())
          timeKey = weekStart.toISOString().split('T')[0]
          break
        case 'month':
          timeKey = result.timestamp.toISOString().slice(0, 7)
          break
      }

      if (!timeSeries.has(timeKey)) {
        timeSeries.set(timeKey, [])
      }

      const value = metric === 'score' ? result.score : (result.metrics[metric] as number)
      if (value !== undefined) {
        timeSeries.get(timeKey)!.push(value)
      }
    }

    const sortedTimeSeries = Array.from(timeSeries.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([timeKey, values]) => ({
        timestamp: new Date(timeKey),
        value: values.reduce((a, b) => a + b, 0) / values.length
      }))

    return sortedTimeSeries
  }

  getTopPerformers(
    metric: string = 'score',
    limit: number = 10,
    filter?: MetricsFilter
  ): Array<{ model: string; value: number; count: number }> {
    const results = this.getResults(filter)
    const modelPerformance: Map<string, { total: number; count: number }> = new Map()

    for (const result of results) {
      const model = result.model || 'unknown'
      const value = metric === 'score' ? result.score : (result.metrics[metric] as number)

      if (!modelPerformance.has(model)) {
        modelPerformance.set(model, { total: 0, count: 0 })
      }

      const perf = modelPerformance.get(model)!
      perf.total += value
      perf.count += 1
    }

    return Array.from(modelPerformance.entries())
      .map(([model, { total, count }]) => ({
        model,
        value: total / count,
        count
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit)
  }

  clearResults(): void {
    this.results = []
  }

  getResultCount(filter?: MetricsFilter): number {
    return this.getResults(filter).length
  }
}
