import { Effect } from "effect";
import { createSearchConfig } from "./config";
import {
	AnalyticsService,
	AntiDetectionService,
	CategorySearchService,
	ContentExtractorService,
	ContentFormatterService,
	ImageSearchService,
	MCPServer,
	NewsSearchService,
	ProxyRotationService,
	QueryEnhancementService,
	ResultSummarizationService,
	SearchService,
	TopicClusteringService,
	SearchHistoryService,
} from "./services";
import { SearchConfig, SearchQuery, SearchWorkflowEvent } from "./types";
import { SearchWorkflow } from "./workflow";
import { ServiceFacade } from "./facade";

export { SearchWorkflowEvent } from "./types";

export class WebSearchApp {
	private searchWorkflow: SearchWorkflow;
	private serviceFacade: ServiceFacade;
	private queryEnhancer: QueryEnhancementService;
	private resultSummarizer: ResultSummarizationService;
	private topicClusterer: TopicClusteringService;

	constructor(config: Partial<SearchConfig> = {}) {
		const searchConfig = createSearchConfig(config);
		const searchService = new SearchService(searchConfig);
		const contentExtractor = new ContentExtractorService();
		const queryEnhancer = new QueryEnhancementService();
		const resultSummarizer = new ResultSummarizationService();
		const topicClusterer = new TopicClusteringService();
		const historyService = new SearchHistoryService(100);
		const analyticsService = new AnalyticsService();
		const antiDetectionService = new AntiDetectionService();
		const mcpServer = new MCPServer(this);
		const imageSearchService = new ImageSearchService();
		const newsSearchService = new NewsSearchService();
		const categorySearchService = new CategorySearchService();
		const contentFormatter = new ContentFormatterService();

		let proxyRotationService: ProxyRotationService | null = null;
		if (searchConfig.proxy.enabled && searchConfig.proxy.proxies.length > 0) {
			proxyRotationService = new ProxyRotationService(searchConfig.proxy);
		}

		this.searchWorkflow = new SearchWorkflow(
			searchService,
			queryEnhancer,
			resultSummarizer,
			topicClusterer,
			historyService,
			analyticsService,
		);

		this.serviceFacade = new ServiceFacade(
			contentExtractor,
			contentFormatter,
			imageSearchService,
			newsSearchService,
			categorySearchService,
			proxyRotationService,
			antiDetectionService,
			mcpServer,
			historyService,
			analyticsService,
		);

		this.queryEnhancer = queryEnhancer;
		this.resultSummarizer = resultSummarizer;
		this.topicClusterer = topicClusterer;
	}

	search(query: SearchQuery | string): Effect.Effect<unknown, Error> {
		return this.searchWorkflow.search(query);
	}

	searchWithProgress(
		query: SearchQuery | string,
		options?: { onProgress?: (event: SearchWorkflowEvent) => void },
	): Effect.Effect<unknown, Error> {
		return this.searchWorkflow.searchWithProgress(query, options);
	}

	extractContent(url: string) {
		return this.serviceFacade.extractContent(url);
	}

	extractContentBatch(urls: string[]) {
		return this.serviceFacade.extractContentBatch(urls);
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
		return this.serviceFacade.getHistory(limit);
	}

	getRecentQueries(limit?: number) {
		return this.serviceFacade.getRecentQueries(limit);
	}

	getHistoryStats() {
		return this.serviceFacade.getHistoryStats();
	}

	clearHistory() {
		return this.serviceFacade.clearHistory();
	}

	getAnalytics() {
		return this.serviceFacade.getAnalytics();
	}

	getAnalyticsStats() {
		return this.serviceFacade.getAnalyticsStats();
	}

	getTopQueries(limit?: number) {
		return this.serviceFacade.getTopQueries(limit);
	}

	getEngineUsage() {
		return this.serviceFacade.getEngineUsage();
	}

	resetAnalytics() {
		return this.serviceFacade.resetAnalytics();
	}

	getNextProxy() {
		return this.serviceFacade.getNextProxy();
	}

	markProxyFailure(proxyUrl: string) {
		return this.serviceFacade.markProxyFailure(proxyUrl);
	}

	markProxySuccess(proxyUrl: string) {
		return this.serviceFacade.markProxySuccess(proxyUrl);
	}

	getProxyStats() {
		return this.serviceFacade.getProxyStats();
	}

	getRandomHeaders() {
		return this.serviceFacade.getRandomHeaders();
	}

	getRandomUserAgent() {
		return this.serviceFacade.getRandomUserAgent();
	}

	getRandomDelay(min?: number, max?: number) {
		return this.serviceFacade.getRandomDelay(min, max);
	}

	simulateHumanBehavior() {
		return this.serviceFacade.simulateHumanBehavior();
	}

	getMCPTools() {
		return this.serviceFacade.getMCPTools();
	}

	async callMCPTool(name: string, args: unknown) {
		return this.serviceFacade.callMCPTool(name, args);
	}

	searchImages(
		query: SearchQuery,
		options?: { size?: "small" | "medium" | "large" | "hd"; minWidth?: number; minHeight?: number },
	) {
		return this.serviceFacade.searchImages(query, options);
	}

	searchNews(query: SearchQuery) {
		return this.serviceFacade.searchNews(query);
	}

	searchByCategory(query: SearchQuery, category: "github" | "research" | "mixed" | "general") {
		return this.serviceFacade.searchByCategory(query, category);
	}

	formatContent(result: any, formats: ("text" | "markdown" | "links" | "structured")[]) {
		return this.serviceFacade.formatContent(result, formats);
	}

	formatBatch(results: any[], formats: ("text" | "markdown" | "links" | "structured")[]) {
		return this.serviceFacade.formatBatch(results, formats);
	}
}
