import { SearchConfig, SearchConfigSchema } from "../types";
import { DEFAULT_ENGINE_CONFIGS } from "../constant";

export const DEFAULT_SEARCH_CONFIG: SearchConfig = Object.freeze({
  engines: DEFAULT_ENGINE_CONFIGS,
  rateLimit: {
    maxRequestsPerMinute: 30,
    maxRequestsPerHour: 1000,
    maxConcurrentRequests: 5,
    backoffMultiplier: 2,
    maxBackoffDelay: 30000,
  },
  cache: {
    enabled: true,
    ttl: 3600000,
    maxSize: 1000,
    strategy: "lru",
  },
  proxy: {
    enabled: false,
    rotationStrategy: "round-robin",
    proxies: [],
    maxFailures: 3,
    cooldownPeriod: 60000,
  },
  ai: {
    enabled: true,
    queryEnhancement: {
      enabled: true,
      maxSuggestions: 5,
    },
    resultSummarization: {
      enabled: true,
      maxSummaryLength: 1000,
      maxKeyPoints: 5,
    },
    topicClustering: {
      enabled: true,
      maxTopics: 10,
    },
  },
  defaultOptions: {
    numResults: 10,
    language: "en",
    region: "us",
    timeRange: "any",
    safeSearch: true,
  },
});

export const createSearchConfig = (partial: Partial<SearchConfig> = {}): SearchConfig => {
  return SearchConfigSchema.parse({
    ...DEFAULT_SEARCH_CONFIG,
    ...partial,
    engines: {
      ...DEFAULT_SEARCH_CONFIG.engines,
      ...partial.engines,
    },
  });
};

export const validateSearchConfig = (config: unknown): SearchConfig => {
  return SearchConfigSchema.parse(config);
};
