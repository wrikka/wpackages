import { Effect } from "effect";
import { ImageResult, SearchQuery, SearchEngineType } from "../types";

export class ImageSearchService {
  constructor(private engines: SearchEngineType[] = ["google", "bing"]) {}

  searchImages(query: SearchQuery, options: { size?: "small" | "medium" | "large" | "hd"; minWidth?: number; minHeight?: number } = {}): Effect.Effect<ImageResult[], Error> {
    return Effect.gen(function* () {
      const results: ImageResult[] = [];

      for (const engine of query.engines) {
        if (engine === "all") continue;

        const engineResults = yield* searchImagesByEngine(engine, query, options);
        results.push(...engineResults);
      }

      return deduplicateImages(results);
    });
  }
}

function searchImagesByEngine(engine: SearchEngineType, query: SearchQuery, options: { size?: string; minWidth?: number; minHeight?: number }): Effect.Effect<ImageResult[], Error> {
  return Effect.gen(function* () {
    const results: ImageResult[] = [];

    switch (engine) {
      case "google":
        const googleImages = yield* searchGoogleImages(query, options);
        results.push(...googleImages);
        break;
      case "bing":
        const bingImages = yield* searchBingImages(query, options);
        results.push(...bingImages);
        break;
    }

    return results;
  });
}

function searchGoogleImages(_query: SearchQuery, _options: { size?: string; minWidth?: number; minHeight?: number }): Effect.Effect<ImageResult[], Error> {
  return Effect.sync(() => {
    return [];
  });
}

function searchBingImages(_query: SearchQuery, _options: { size?: string; minWidth?: number; minHeight?: number }): Effect.Effect<ImageResult[], Error> {
  return Effect.sync(() => {
    return [];
  });
}

function deduplicateImages(images: ImageResult[]): ImageResult[] {
  const seen = new Set<string>();
  const deduplicated: ImageResult[] = [];

  for (const image of images) {
    const key = image.url;
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(image);
    }
  }

  return deduplicated;
}
