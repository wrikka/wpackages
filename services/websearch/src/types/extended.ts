import { z } from "zod";

export const ResultTypeSchema = z.enum(["web", "images", "news"]);
export type ResultType = z.infer<typeof ResultTypeSchema>;

export const SearchCategorySchema = z.enum(["general", "github", "research", "mixed"]);
export type SearchCategory = z.infer<typeof SearchCategorySchema>;

export const ContentFormatSchema = z.enum(["text", "markdown", "links", "structured"]);
export type ContentFormat = z.infer<typeof ContentFormatSchema>;

export const ImageResultSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  thumbnail: z.string().url().optional(),
  width: z.number().int().min(0).optional(),
  height: z.number().int().min(0).optional(),
  source: z.string().url().optional(),
  size: z.enum(["small", "medium", "large", "hd"]).optional(),
  score: z.number().min(0).max(1),
  engine: z.string(),
});

export type ImageResult = z.infer<typeof ImageResultSchema>;

export const NewsResultSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  snippet: z.string(),
  source: z.string(),
  publishedDate: z.string().optional(),
  age: z.string().optional(),
  score: z.number().min(0).max(1),
  engine: z.string(),
});

export type NewsResult = z.infer<typeof NewsResultSchema>;

export const StructuredContentSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  content: z.string(),
  markdown: z.string().optional(),
  links: z.array(z.object({ text: z.string(), url: z.string().url() })).default([]),
  metadata: z.record(z.string(), z.unknown()).default({}),
  wordCount: z.number().int().min(0),
  extractionTime: z.number().min(0),
});

export type StructuredContent = z.infer<typeof StructuredContentSchema>;

export const ExtendedSearchQuerySchema = z.object({
  resultTypes: z.array(ResultTypeSchema).default(["web"]),
  category: SearchCategorySchema.default("general"),
  contentFormats: z.array(ContentFormatSchema).default(["text"]),
  imageSize: z.enum(["small", "medium", "large", "hd"]).optional(),
  minImageWidth: z.number().int().min(0).optional(),
  minImageHeight: z.number().int().min(0).optional(),
});

export type ExtendedSearchQuery = z.infer<typeof ExtendedSearchQuerySchema>;

export const ExtendedSearchResponseSchema = z.object({
  query: z.string(),
  web: z.array(z.any()).default([]),
  images: z.array(ImageResultSchema).default([]),
  news: z.array(NewsResultSchema).default([]),
  totalResults: z.number().int().min(0),
  resultTypes: z.array(ResultTypeSchema),
  category: SearchCategorySchema,
  searchTime: z.number().min(0),
});

export type ExtendedSearchResponse = z.infer<typeof ExtendedSearchResponseSchema>;
