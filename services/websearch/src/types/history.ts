import { z } from "zod";

export const SearchHistoryEntrySchema = z.object({
  id: z.string().uuid(),
  query: z.string(),
  timestamp: z.string().datetime(),
  resultsCount: z.number().int().min(0),
  enginesUsed: z.array(z.string()),
  searchTime: z.number().min(0),
  cached: z.boolean(),
});

export type SearchHistoryEntry = z.infer<typeof SearchHistoryEntrySchema>;

export const SearchHistorySchema = z.object({
  entries: z.array(SearchHistoryEntrySchema),
  maxSize: z.number().int().min(1).default(100),
});

export type SearchHistory = z.infer<typeof SearchHistorySchema>;
