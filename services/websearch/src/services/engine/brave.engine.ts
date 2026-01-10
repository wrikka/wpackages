import { Effect } from "effect";
import { BaseEngine } from "./base.engine";
import { SearchResult, SearchQuery, EngineConfig } from "../../types";
import { parseResults } from "../../utils";

export class BraveEngine extends BaseEngine {
  constructor(config: Partial<EngineConfig> = {}) {
    super("brave", {
      enabled: true,
      priority: 6,
      baseUrl: "https://search.brave.com/search",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      timeout: 10000,
      maxRetries: 3,
      retryDelay: 1000,
      ...config,
    });
  }

  search(query: SearchQuery): Effect.Effect<SearchResult[], Error> {
    return Effect.gen(this, function* () {
      const url = this.buildUrl(query);
      const html = yield* this.fetchWithRetry(url);
      const results = parseResults(html, "brave");
      return results.slice(0, query.numResults);
    });
  }
}
