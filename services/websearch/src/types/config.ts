import { z } from "zod";
import { SearchEngineType } from "./search";

export const EngineConfigSchema = z.object({
  enabled: z.boolean().default(true),
  priority: z.number().int().min(1).max(10).default(5),
  baseUrl: z.string().url(),
  userAgent: z.string().default("Mozilla/5.0 (compatible; @wpackages/websearch/1.0)"),
  timeout: z.number().int().min(1000).max(60000).default(10000),
  maxRetries: z.number().int().min(0).max(5).default(3),
  retryDelay: z.number().int().min(100).max(5000).default(1000),
});

export type EngineConfig = z.infer<typeof EngineConfigSchema>;

export const RateLimitConfigSchema = z.object({
  maxRequestsPerMinute: z.number().int().min(1).default(30),
  maxRequestsPerHour: z.number().int().min(1).default(1000),
  maxConcurrentRequests: z.number().int().min(1).default(5),
  backoffMultiplier: z.number().min(1).max(10).default(2),
  maxBackoffDelay: z.number().int().min(1000).max(60000).default(30000),
});

export type RateLimitConfig = z.infer<typeof RateLimitConfigSchema>;

export const CacheConfigSchema = z.object({
  enabled: z.boolean().default(true),
  ttl: z.number().int().min(0).default(3600000),
  maxSize: z.number().int().min(1).default(1000),
  strategy: z.enum(["lru", "fifo", "lfu"]).default("lru"),
});

export type CacheConfig = z.infer<typeof CacheConfigSchema>;

export const ProxyConfigSchema = z.object({
  enabled: z.boolean().default(false),
  rotationStrategy: z.enum(["round-robin", "random", "least-used"]).default("round-robin"),
  proxies: z.array(z.object({
    url: z.string().url(),
    username: z.string().optional(),
    password: z.string().optional(),
    priority: z.number().int().min(1).max(10).default(5),
  })).default([]),
  maxFailures: z.number().int().min(1).default(3),
  cooldownPeriod: z.number().int().min(1000).default(60000),
});

export type ProxyConfig = z.infer<typeof ProxyConfigSchema>;

export const AIConfigSchema = z.object({
  enabled: z.boolean().default(true),
  queryEnhancement: z.object({
    enabled: z.boolean().default(true),
    maxSuggestions: z.number().int().min(1).max(10).default(5),
  }).default({}),
  resultSummarization: z.object({
    enabled: z.boolean().default(true),
    maxSummaryLength: z.number().int().min(100).max(5000).default(1000),
    maxKeyPoints: z.number().int().min(1).max(20).default(5),
  }).default({}),
  topicClustering: z.object({
    enabled: z.boolean().default(true),
    maxTopics: z.number().int().min(1).max(20).default(10),
  }).default({}),
});

export type AIConfig = z.infer<typeof AIConfigSchema>;

export const SearchConfigSchema = z.object({
  engines: z.record(SearchEngineType, EngineConfigSchema).default({}),
  rateLimit: RateLimitConfigSchema.default({}),
  cache: CacheConfigSchema.default({}),
  proxy: ProxyConfigSchema.default({}),
  ai: AIConfigSchema.default({}),
  defaultOptions: z.object({
    numResults: z.number().int().min(1).max(100).default(10),
    language: z.string().default("en"),
    region: z.string().default("us"),
    timeRange: z.enum(["any", "day", "week", "month", "year"]).default("any"),
    safeSearch: z.boolean().default(true),
  }).default({}),
});

export type SearchConfig = z.infer<typeof SearchConfigSchema>;
