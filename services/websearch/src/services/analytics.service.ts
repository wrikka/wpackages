import { Effect } from "effect";
import { AnalyticsData, SearchMetric, AnalyticsDataSchema } from "../types";

export class AnalyticsService {
  private analytics: AnalyticsData;

  constructor() {
    this.analytics = {
      totalSearches: 0,
      successfulSearches: 0,
      failedSearches: 0,
      averageSearchTime: 0,
      averageResultsCount: 0,
      cacheHitRate: 0,
      topQueries: [],
      engineUsage: {},
      metrics: [],
    };
  }

  recordMetric(metric: SearchMetric): Effect.Effect<void, Error> {
    return Effect.sync(() => {
      this.analytics.metrics.push(metric);
      this.analytics.totalSearches++;

      if (metric.success) {
        this.analytics.successfulSearches++;
      } else {
        this.analytics.failedSearches++;
      }

      this.updateAverages();
      this.updateCacheHitRate();
      this.updateTopQueries();
      this.updateEngineUsage(metric);

      if (this.analytics.metrics.length > 1000) {
        this.analytics.metrics = this.analytics.metrics.slice(-1000);
      }
    });
  }

  private updateAverages(): void {
    const metrics = this.analytics.metrics;
    if (metrics.length === 0) return;

    const totalTime = metrics.reduce((sum, m) => sum + m.searchTime, 0);
    const totalResults = metrics.reduce((sum, m) => sum + m.resultsCount, 0);

    this.analytics.averageSearchTime = totalTime / metrics.length;
    this.analytics.averageResultsCount = totalResults / metrics.length;
  }

  private updateCacheHitRate(): void {
    const metrics = this.analytics.metrics;
    if (metrics.length === 0) return;

    const cachedCount = metrics.filter((m) => m.cached).length;
    this.analytics.cacheHitRate = cachedCount / metrics.length;
  }

  private updateTopQueries(): void {
    const queryCounts = new Map<string, number>();

    for (const metric of this.analytics.metrics) {
      const count = queryCounts.get(metric.query) || 0;
      queryCounts.set(metric.query, count + 1);
    }

    this.analytics.topQueries = Array.from(queryCounts.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private updateEngineUsage(metric: SearchMetric): void {
    const engine = metric.engine;
    this.analytics.engineUsage[engine] = (this.analytics.engineUsage[engine] || 0) + 1;
  }

  getAnalytics(): Effect.Effect<AnalyticsData, Error> {
    return Effect.sync(() => {
      return AnalyticsDataSchema.parse(this.analytics);
    });
  }

  getStats(): Effect.Effect<{ totalSearches: number; successRate: number; averageTime: number; cacheHitRate: number }, Error> {
    return Effect.sync(() => {
      const successRate =
        this.analytics.totalSearches > 0 ? this.analytics.successfulSearches / this.analytics.totalSearches : 0;

      return {
        totalSearches: this.analytics.totalSearches,
        successRate,
        averageTime: this.analytics.averageSearchTime,
        cacheHitRate: this.analytics.cacheHitRate,
      };
    });
  }

  getTopQueries(limit: number = 10): Effect.Effect<Array<{ query: string; count: number }>, Error> {
    return Effect.sync(() => {
      return this.analytics.topQueries.slice(0, limit);
    });
  }

  getEngineUsage(): Effect.Effect<Record<string, number>, Error> {
    return Effect.sync(() => {
      return { ...this.analytics.engineUsage };
    });
  }

  reset(): Effect.Effect<void, Error> {
    return Effect.sync(() => {
      this.analytics = {
        totalSearches: 0,
        successfulSearches: 0,
        failedSearches: 0,
        averageSearchTime: 0,
        averageResultsCount: 0,
        cacheHitRate: 0,
        topQueries: [],
        engineUsage: {},
        metrics: [],
      };
    });
  }

  toJSON(): AnalyticsData {
    return AnalyticsDataSchema.parse(this.analytics);
  }

  fromJSON(data: unknown): Effect.Effect<void, Error> {
    return Effect.try(() => {
      this.analytics = AnalyticsDataSchema.parse(data);
    });
  }
}
