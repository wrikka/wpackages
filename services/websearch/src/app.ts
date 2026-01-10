import { Effect } from "effect";
import {
  SearchService,
  SearchEngineProgressEvent,
  ContentExtractorService,
  QueryEnhancementService,
  ResultSummarizationService,
  TopicClusteringService,
  SearchHistoryService,
  AnalyticsService,
  ProxyRotationService,
  AntiDetectionService,
  MCPServer,
  ImageSearchService,
  NewsSearchService,
  CategorySearchService,
  ContentFormatterService,
} from "./services";
import { SearchQuery, SearchConfig, SearchQuerySchema, SearchHistoryEntry, SearchMetric } from "./types";
import { createSearchConfig } from "./config";
import { randomUUID } from "node:crypto";

export type SearchWorkflowEvent =
  | { type: "workflow:start"; at: string; query: string }
  | { type: "workflow:stage:start"; at: string; stage: "enhance" | "search" | "summarize" | "cluster" }
  | { type: "workflow:stage:success"; at: string; stage: "enhance" | "search" | "summarize" | "cluster"; durationMs: number }
  | { type: "workflow:stage:error"; at: string; stage: "enhance" | "search" | "summarize" | "cluster"; durationMs: number; error: string }
  | { type: "workflow:complete"; at: string; durationMs: number }
  | { type: "workflow:error"; at: string; durationMs: number; error: string }
  | SearchEngineProgressEvent;

export class WebSearchApp {
  private searchService: SearchService;
  private contentExtractor: ContentExtractorService;
  private queryEnhancer: QueryEnhancementService;
  private resultSummarizer: ResultSummarizationService;
  private topicClusterer: TopicClusteringService;
  private historyService: SearchHistoryService;
  private analyticsService: AnalyticsService;
  private proxyRotationService: ProxyRotationService | null = null;
  private antiDetectionService: AntiDetectionService;
  private mcpServer: MCPServer;
  private imageSearchService: ImageSearchService;
  private newsSearchService: NewsSearchService;
  private categorySearchService: CategorySearchService;
  private contentFormatterService: ContentFormatterService;

  constructor(config: Partial<SearchConfig> = {}) {
    const searchConfig = createSearchConfig(config);
    this.searchService = new SearchService(searchConfig);
    this.contentExtractor = new ContentExtractorService();
    this.queryEnhancer = new QueryEnhancementService();
    this.resultSummarizer = new ResultSummarizationService();
    this.topicClusterer = new TopicClusteringService();
    this.historyService = new SearchHistoryService(100);
    this.analyticsService = new AnalyticsService();
    this.antiDetectionService = new AntiDetectionService();
    this.mcpServer = new MCPServer(this);
    this.imageSearchService = new ImageSearchService();
    this.newsSearchService = new NewsSearchService();
    this.categorySearchService = new CategorySearchService();
    this.contentFormatterService = new ContentFormatterService();

    if (searchConfig.proxy.enabled && searchConfig.proxy.proxies.length > 0) {
      this.proxyRotationService = new ProxyRotationService(searchConfig.proxy);
    }
  }

  search(query: SearchQuery | string): Effect.Effect<unknown, Error> {
    return Effect.gen(this, function* () {
      const parsedQuery = typeof query === "string" ? SearchQuerySchema.parse({ query }) : SearchQuerySchema.parse(query);

      const enhancement = yield* this.queryEnhancer.enhance(parsedQuery);

      const searchResponse = yield* this.searchService.search(parsedQuery);

      const summary = yield* this.resultSummarizer.summarize(searchResponse.results, 1000, 5);

      const clusters = yield* this.topicClusterer.cluster(searchResponse.results, 10);

      const historyEntry: SearchHistoryEntry = {
        id: randomUUID(),
        query: searchResponse.query,
        timestamp: new Date().toISOString(),
        resultsCount: searchResponse.totalResults,
        enginesUsed: searchResponse.enginesUsed,
        searchTime: searchResponse.searchTime,
        cached: searchResponse.cached,
      };

      yield* this.historyService.addEntry(historyEntry);

      for (const engine of searchResponse.enginesUsed) {
        const metric: SearchMetric = {
          query: searchResponse.query,
          timestamp: new Date().toISOString(),
          engine,
          resultsCount: searchResponse.totalResults,
          searchTime: searchResponse.searchTime,
          cached: searchResponse.cached,
          success: true,
        };
        yield* this.analyticsService.recordMetric(metric);
      }

      return {
        query: searchResponse.query,
        enhancement,
        results: searchResponse.results,
        summary,
        clusters,
        metadata: {
          totalResults: searchResponse.totalResults,
          enginesUsed: searchResponse.enginesUsed,
          searchTime: searchResponse.searchTime,
          cached: searchResponse.cached,
        },
      };
    });
  }

  searchWithProgress(
    query: SearchQuery | string,
    options?: { onProgress?: (event: SearchWorkflowEvent) => void },
  ): Effect.Effect<unknown, Error> {
    const workflowStartAt = Date.now();

    return Effect.gen(this, function* () {
      const parsedQuery = typeof query === "string" ? SearchQuerySchema.parse({ query }) : SearchQuerySchema.parse(query);

      const onProgress = options?.onProgress;

      yield* Effect.sync(() => {
        onProgress?.({ type: "workflow:start", at: new Date().toISOString(), query: parsedQuery.query });
      });

      const stageEnhanceStartedAt = Date.now();
      yield* Effect.sync(() => {
        onProgress?.({ type: "workflow:stage:start", at: new Date().toISOString(), stage: "enhance" });
      });

      const enhancement = yield* this.queryEnhancer.enhance(parsedQuery).pipe(
        Effect.tap(() =>
          Effect.sync(() => {
            onProgress?.({
              type: "workflow:stage:success",
              at: new Date().toISOString(),
              stage: "enhance",
              durationMs: Date.now() - stageEnhanceStartedAt,
            });
          })
        ),
        Effect.tapError((error) =>
          Effect.sync(() => {
            onProgress?.({
              type: "workflow:stage:error",
              at: new Date().toISOString(),
              stage: "enhance",
              durationMs: Date.now() - stageEnhanceStartedAt,
              error: error.message,
            });
          })
        ),
      );

      const stageSearchStartedAt = Date.now();
      yield* Effect.sync(() => {
        onProgress?.({ type: "workflow:stage:start", at: new Date().toISOString(), stage: "search" });
      });

      const searchResponse = yield* this.searchService.searchWithProgress(parsedQuery, {
        onProgress: (event: SearchEngineProgressEvent) => onProgress?.(event),
      }).pipe(
        Effect.tap(() =>
          Effect.sync(() => {
            onProgress?.({
              type: "workflow:stage:success",
              at: new Date().toISOString(),
              stage: "search",
              durationMs: Date.now() - stageSearchStartedAt,
            });
          })
        ),
        Effect.tapError((error: Error) =>
          Effect.sync(() => {
            onProgress?.({
              type: "workflow:stage:error",
              at: new Date().toISOString(),
              stage: "search",
              durationMs: Date.now() - stageSearchStartedAt,
              error: error.message,
            });
          })
        ),
      );

      const stageSummarizeStartedAt = Date.now();
      yield* Effect.sync(() => {
        onProgress?.({ type: "workflow:stage:start", at: new Date().toISOString(), stage: "summarize" });
      });

      const summary = yield* this.resultSummarizer.summarize(searchResponse.results, 1000, 5).pipe(
        Effect.tap(() =>
          Effect.sync(() => {
            onProgress?.({
              type: "workflow:stage:success",
              at: new Date().toISOString(),
              stage: "summarize",
              durationMs: Date.now() - stageSummarizeStartedAt,
            });
          })
        ),
        Effect.tapError((error: Error) =>
          Effect.sync(() => {
            onProgress?.({
              type: "workflow:stage:error",
              at: new Date().toISOString(),
              stage: "summarize",
              durationMs: Date.now() - stageSummarizeStartedAt,
              error: error.message,
            });
          })
        ),
      );

      const stageClusterStartedAt = Date.now();
      yield* Effect.sync(() => {
        onProgress?.({ type: "workflow:stage:start", at: new Date().toISOString(), stage: "cluster" });
      });

      const clusters = yield* this.topicClusterer.cluster(searchResponse.results, 10).pipe(
        Effect.tap(() =>
          Effect.sync(() => {
            onProgress?.({
              type: "workflow:stage:success",
              at: new Date().toISOString(),
              stage: "cluster",
              durationMs: Date.now() - stageClusterStartedAt,
            });
          })
        ),
        Effect.tapError((error: Error) =>
          Effect.sync(() => {
            onProgress?.({
              type: "workflow:stage:error",
              at: new Date().toISOString(),
              stage: "cluster",
              durationMs: Date.now() - stageClusterStartedAt,
              error: error.message,
            });
          })
        ),
      );

      const historyEntry: SearchHistoryEntry = {
        id: randomUUID(),
        query: searchResponse.query,
        timestamp: new Date().toISOString(),
        resultsCount: searchResponse.totalResults,
        enginesUsed: searchResponse.enginesUsed,
        searchTime: searchResponse.searchTime,
        cached: searchResponse.cached,
      };

      yield* this.historyService.addEntry(historyEntry);

      for (const engine of searchResponse.enginesUsed) {
        const metric: SearchMetric = {
          query: searchResponse.query,
          timestamp: new Date().toISOString(),
          engine,
          resultsCount: searchResponse.totalResults,
          searchTime: searchResponse.searchTime,
          cached: searchResponse.cached,
          success: true,
        };
        yield* this.analyticsService.recordMetric(metric);
      }

      yield* Effect.sync(() => {
        onProgress?.({
          type: "workflow:complete",
          at: new Date().toISOString(),
          durationMs: Date.now() - workflowStartAt,
        });
      });

      return {
        query: searchResponse.query,
        enhancement,
        results: searchResponse.results,
        summary,
        clusters,
        metadata: {
          totalResults: searchResponse.totalResults,
          enginesUsed: searchResponse.enginesUsed,
          searchTime: searchResponse.searchTime,
          cached: searchResponse.cached,
        },
      };
    }).pipe(
      Effect.tapError((error: Error) =>
        Effect.sync(() => {
          options?.onProgress?.({
            type: "workflow:error",
            at: new Date().toISOString(),
            durationMs: Date.now() - workflowStartAt,
            error: error.message,
          });
        })
      ),
    );
  }

  extractContent(url: string) {
    return this.contentExtractor.extract(url);
  }

  extractContentBatch(urls: string[]) {
    return this.contentExtractor.extractBatch(urls);
  }

  enhanceQuery(query: SearchQuery) {
    return this.queryEnhancer.enhance(query);
  }

  summarizeResults(results: any[], maxLength?: number, maxKeyPoints?: number) {
    return this.resultSummarizer.summarize(results, maxLength, maxKeyPoints);
  }

  clusterResults(results: any[], maxTopics?: number) {
    return this.topicClusterer.cluster(results, maxTopics);
  }

  getHistory(limit?: number) {
    return this.historyService.getHistory(limit);
  }

  getRecentQueries(limit?: number) {
    return this.historyService.getRecentQueries(limit);
  }

  getHistoryStats() {
    return this.historyService.getStats();
  }

  clearHistory() {
    return this.historyService.clearHistory();
  }

  getAnalytics() {
    return this.analyticsService.getAnalytics();
  }

  getAnalyticsStats() {
    return this.analyticsService.getStats();
  }

  getTopQueries(limit?: number) {
    return this.analyticsService.getTopQueries(limit);
  }

  getEngineUsage() {
    return this.analyticsService.getEngineUsage();
  }

  resetAnalytics() {
    return this.analyticsService.reset();
  }

  getNextProxy() {
    if (!this.proxyRotationService) {
      return Effect.succeed(null);
    }
    return this.proxyRotationService.getNextProxy();
  }

  markProxyFailure(proxyUrl: string) {
    if (!this.proxyRotationService) {
      return Effect.succeed(undefined);
    }
    return this.proxyRotationService.markFailure(proxyUrl);
  }

  markProxySuccess(proxyUrl: string) {
    if (!this.proxyRotationService) {
      return Effect.succeed(undefined);
    }
    return this.proxyRotationService.markSuccess(proxyUrl);
  }

  getProxyStats() {
    if (!this.proxyRotationService) {
      return Effect.succeed({ total: 0, available: 0, failed: 0, inCooldown: 0 });
    }
    return this.proxyRotationService.getStats();
  }

  getRandomHeaders() {
    return this.antiDetectionService.getRandomHeaders();
  }

  getRandomUserAgent() {
    return this.antiDetectionService.getRandomUserAgent();
  }

  getRandomDelay(min?: number, max?: number) {
    return this.antiDetectionService.getRandomDelay(min, max);
  }

  simulateHumanBehavior() {
    return this.antiDetectionService.simulateHumanBehavior();
  }

  getMCPTools() {
    return Effect.sync(() => this.mcpServer.getTools());
  }

  async callMCPTool(name: string, args: unknown) {
    return this.mcpServer.callTool(name, args);
  }

  searchImages(query: SearchQuery, options?: { size?: "small" | "medium" | "large" | "hd"; minWidth?: number; minHeight?: number }) {
    return this.imageSearchService.searchImages(query, options);
  }

  searchNews(query: SearchQuery) {
    return this.newsSearchService.searchNews(query);
  }

  searchByCategory(query: SearchQuery, category: "github" | "research" | "mixed" | "general") {
    return this.categorySearchService.searchByCategory(query, category);
  }

  formatContent(result: any, formats: ("text" | "markdown" | "links" | "structured")[]) {
    return this.contentFormatterService.formatContent(result, formats);
  }

  formatBatch(results: any[], formats: ("text" | "markdown" | "links" | "structured")[]) {
    return this.contentFormatterService.formatBatch(results, formats);
  }
}
