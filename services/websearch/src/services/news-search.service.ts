import { Effect } from "effect";
import { NewsResult, SearchQuery, SearchEngineType } from "../types";

export class NewsSearchService {
  constructor(private engines: SearchEngineType[] = ["google", "bing"]) {}

  searchNews(query: SearchQuery): Effect.Effect<NewsResult[], Error> {
    return Effect.gen(function* () {
      const results: NewsResult[] = [];

      for (const engine of query.engines) {
        if (engine === "all") continue;

        const engineResults = yield* searchNewsByEngine(engine, query);
        results.push(...engineResults);
      }

      return deduplicateNews(results);
    });
  }
}

function searchNewsByEngine(engine: SearchEngineType, query: SearchQuery): Effect.Effect<NewsResult[], Error> {
  return Effect.gen(function* () {
    const results: NewsResult[] = [];

    switch (engine) {
      case "google":
        const googleNews = yield* searchGoogleNews(query);
        results.push(...googleNews);
        break;
      case "bing":
        const bingNews = yield* searchBingNews(query);
        results.push(...bingNews);
        break;
    }

    return results;
  });
}

function searchGoogleNews(_query: SearchQuery): Effect.Effect<NewsResult[], Error> {
  return Effect.sync(() => {
    return [];
  });
}

function searchBingNews(_query: SearchQuery): Effect.Effect<NewsResult[], Error> {
  return Effect.sync(() => {
    return [];
  });
}

function deduplicateNews(news: NewsResult[]): NewsResult[] {
  const seen = new Set<string>();
  const deduplicated: NewsResult[] = [];

  for (const item of news) {
    const key = item.url;
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(item);
    }
  }

  return deduplicated;
}
