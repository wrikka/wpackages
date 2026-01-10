import { z } from "zod";

export const SearchEngineType = z.enum(["google", "bing", "duckduckgo", "brave", "all"]);
export type SearchEngineType = z.infer<typeof SearchEngineType>;

export const SearchQuerySchema = z.object({
  query: z.string().min(1),
  engines: z.array(SearchEngineType).default(["all"]),
  numResults: z.number().int().min(1).max(100).default(10),
  language: z.string().default("en"),
  region: z.string().default("us"),
  timeRange: z.enum(["any", "day", "week", "month", "year"]).default("any"),
  safeSearch: z.boolean().default(true),
  includeRawContent: z.boolean().default(false),
  maxTokensPerPage: z.number().int().min(0).default(512),
  siteFilter: z.string().optional(),
  excludeDomains: z.array(z.string()).default([]),
  includeDomains: z.array(z.string()).default([]),
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;

export const SearchResultSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  snippet: z.string(),
  content: z.string().optional(),
  publishedDate: z.string().optional(),
  author: z.string().optional(),
  score: z.number().min(0).max(1),
  engine: SearchEngineType,
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export type SearchResult = z.infer<typeof SearchResultSchema>;

export const SearchResponseSchema = z.object({
  query: z.string(),
  results: z.array(SearchResultSchema),
  totalResults: z.number().int().min(0),
  enginesUsed: z.array(SearchEngineType),
  searchTime: z.number().min(0),
  cached: z.boolean().default(false),
});

export type SearchResponse = z.infer<typeof SearchResponseSchema>;

export const ContentExtractionSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  content: z.string(),
  author: z.string().optional(),
  publishedDate: z.string().optional(),
  wordCount: z.number().int().min(0),
  extractionTime: z.number().min(0),
});

export type ContentExtraction = z.infer<typeof ContentExtractionSchema>;

export const QueryEnhancementSchema = z.object({
  originalQuery: z.string(),
  enhancedQuery: z.string(),
  suggestedQueries: z.array(z.string()).default([]),
  reasoning: z.string().optional(),
});

export type QueryEnhancement = z.infer<typeof QueryEnhancementSchema>;

export const ResultSummarySchema = z.object({
  summary: z.string(),
  keyPoints: z.array(z.string()).default([]),
  topics: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1),
});

export type ResultSummary = z.infer<typeof ResultSummarySchema>;

export const SearchErrorSchema = z.object({
  code: z.enum(["RATE_LIMITED", "ENGINE_ERROR", "NETWORK_ERROR", "PARSING_ERROR", "INVALID_QUERY", "UNKNOWN"]),
  message: z.string(),
  engine: SearchEngineType.optional(),
  details: z.record(z.string(), z.unknown()).default({}),
});

export type SearchError = z.infer<typeof SearchErrorSchema>;
