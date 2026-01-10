import { Effect } from "effect";
import { SearchQuery, SearchResponse, SearchEngineType, SearchConfig } from "../types";
import { GoogleEngine, BingEngine, DuckDuckGoEngine, BraveEngine } from "./engine";
import { deduplicateResults, scoreResults, sortByScore } from "../utils";

export type SearchEngineProgressEvent =
  | { type: "engine:start"; engine: SearchEngineType; at: string }
  | { type: "engine:success"; engine: SearchEngineType; at: string; resultsCount: number; durationMs: number }
  | { type: "engine:error"; engine: SearchEngineType; at: string; error: string; durationMs: number };

export class SearchService {
  constructor(private config: SearchConfig) {
    this.engines = {
      google: new GoogleEngine(this.config.engines.google),
      bing: new BingEngine(this.config.engines.bing),
      duckduckgo: new DuckDuckGoEngine(this.config.engines.duckduckgo),
      brave: new BraveEngine(this.config.engines.brave),
    };
  }

  private engines: Record<SearchEngineType, GoogleEngine | BingEngine | DuckDuckGoEngine | BraveEngine>;

  search(query: SearchQuery): Effect.Effect<SearchResponse, Error> {
    return Effect.gen(this, function* () {
      const startTime = Date.now();
      const enginesToUse = this.getEnginesToUse(query.engines);

      const results = yield* Effect.all(
        enginesToUse.map((engine) => this.engines[engine].search(query)),
        { concurrency: this.config.rateLimit.maxConcurrentRequests },
      );

      const allResults = results.flat();
      const deduplicated = deduplicateResults(allResults);
      const scored = scoreResults(deduplicated, query);
      const sorted = sortByScore(scored);

      const searchTime = Date.now() - startTime;

      return {
        query: query.query,
        results: sorted.slice(0, query.numResults),
        totalResults: sorted.length,
        enginesUsed: enginesToUse,
        searchTime,
        cached: false,
      };
    });
  }

  searchWithProgress(
    query: SearchQuery,
    options?: { onProgress?: (event: SearchEngineProgressEvent) => void },
  ): Effect.Effect<SearchResponse, Error> {
    return Effect.tryPromise({
      try: async () => {
        const startTime = Date.now();
        const enginesToUse = this.getEnginesToUse(query.engines);

        const onProgress = options?.onProgress;

        const tasks = enginesToUse.map((engine) => {
          const startedAt = Date.now();
          onProgress?.({ type: "engine:start", engine, at: new Date().toISOString() });

          return Effect.runPromise(this.engines[engine].search(query))
            .then((results) => {
              onProgress?.({
                type: "engine:success",
                engine,
                at: new Date().toISOString(),
                resultsCount: results.length,
                durationMs: Date.now() - startedAt,
              });
              return results;
            })
            .catch((error: unknown) => {
              onProgress?.({
                type: "engine:error",
                engine,
                at: new Date().toISOString(),
                error: error instanceof Error ? error.message : String(error),
                durationMs: Date.now() - startedAt,
              });
              return [];
            });
        });

        const resultsByEngine = await Promise.all(tasks);

        const allResults = resultsByEngine.flat();
        const deduplicated = deduplicateResults(allResults);
        const scored = scoreResults(deduplicated, query);
        const sorted = sortByScore(scored);

        const searchTime = Date.now() - startTime;

        return {
          query: query.query,
          results: sorted.slice(0, query.numResults),
          totalResults: sorted.length,
          enginesUsed: enginesToUse,
          searchTime,
          cached: false,
        };
      },
      catch: (error) => (error instanceof Error ? error : new Error(String(error))),
    });
  }

  private getEnginesToUse(requested: SearchEngineType[]): SearchEngineType[] {
    if (requested.includes("all")) {
      return (["google", "bing", "duckduckgo", "brave"] as SearchEngineType[]).filter(
        (engine) => this.config.engines[engine]?.enabled,
      );
    }

    return requested.filter((engine) => engine !== "all" && this.config.engines[engine]?.enabled);
  }
}
