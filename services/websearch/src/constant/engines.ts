import { SearchEngineType, EngineConfig } from "../types";

export const DEFAULT_ENGINE_CONFIGS: Record<SearchEngineType, EngineConfig> = Object.freeze({
  google: {
    enabled: true,
    priority: 10,
    baseUrl: "https://www.google.com/search",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    timeout: 10000,
    maxRetries: 3,
    retryDelay: 1000,
  },
  bing: {
    enabled: true,
    priority: 8,
    baseUrl: "https://www.bing.com/search",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    timeout: 10000,
    maxRetries: 3,
    retryDelay: 1000,
  },
  duckduckgo: {
    enabled: true,
    priority: 7,
    baseUrl: "https://html.duckduckgo.com/html",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    timeout: 10000,
    maxRetries: 3,
    retryDelay: 1000,
  },
  brave: {
    enabled: true,
    priority: 6,
    baseUrl: "https://search.brave.com/search",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    timeout: 10000,
    maxRetries: 3,
    retryDelay: 1000,
  },
  all: {
    enabled: true,
    priority: 1,
    baseUrl: "",
    userAgent: "",
    timeout: 10000,
    maxRetries: 3,
    retryDelay: 1000,
  },
});
