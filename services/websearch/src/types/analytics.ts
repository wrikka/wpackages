import { z } from "zod";

export const SearchMetricSchema = z.object({
  query: z.string(),
  timestamp: z.string().datetime(),
  engine: z.string(),
  resultsCount: z.number().int().min(0),
  searchTime: z.number().min(0),
  cached: z.boolean(),
  success: z.boolean(),
  error: z.string().optional(),
});

export type SearchMetric = z.infer<typeof SearchMetricSchema>;

export const AnalyticsDataSchema = z.object({
  totalSearches: z.number().int().min(0).default(0),
  successfulSearches: z.number().int().min(0).default(0),
  failedSearches: z.number().int().min(0).default(0),
  averageSearchTime: z.number().min(0).default(0),
  averageResultsCount: z.number().min(0).default(0),
  cacheHitRate: z.number().min(0).max(1).default(0),
  topQueries: z.array(z.object({ query: z.string(), count: z.number().int() })).default([]),
  engineUsage: z.record(z.string(), z.number().int()).default({}),
  metrics: z.array(SearchMetricSchema).default([]),
});

export type AnalyticsData = z.infer<typeof AnalyticsDataSchema>;
