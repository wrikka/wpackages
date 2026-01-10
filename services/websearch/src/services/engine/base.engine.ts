import { Effect } from "effect";
import { SearchResult, SearchQuery, SearchEngineType, EngineConfig } from "../../types";
import { buildQueryParams } from "../../utils";

export interface SearchEngine {
  readonly name: SearchEngineType;
  readonly config: EngineConfig;
  search(query: SearchQuery): Effect.Effect<SearchResult[], Error>;
}

export abstract class BaseEngine implements SearchEngine {
  constructor(
    public readonly name: SearchEngineType,
    public readonly config: EngineConfig,
  ) {}

  abstract search(query: SearchQuery): Effect.Effect<SearchResult[], Error>;

  protected buildUrl(query: SearchQuery): string {
    const params = buildQueryParams(query, this.name);
    const url = new URL(this.config.baseUrl);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    return url.toString();
  }

  protected fetchWithRetry(url: string, retries: number = this.config.maxRetries): Effect.Effect<string, Error> {
    return Effect.gen(this, function* () {
      if (retries <= 0) {
        return yield* Effect.fail(new Error(`Max retries exceeded for ${this.name}`));
      }

      const response = yield* Effect.tryPromise({
        try: () =>
          fetch(url, {
            headers: {
              "User-Agent": this.config.userAgent,
              Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
              "Accept-Language": "en-US,en;q=0.5",
              Connection: "keep-alive",
            },
            signal: AbortSignal.timeout(this.config.timeout),
          }),
        catch: (error) => new Error(`Fetch failed for ${this.name}: ${error}`),
      });

      if (!response.ok) {
        if (response.status === 429) {
          yield* Effect.sleep(this.config.retryDelay);
          return yield* this.fetchWithRetry(url, retries - 1);
        }
        return yield* Effect.fail(new Error(`HTTP ${response.status} for ${this.name}`));
      }

      return yield* Effect.tryPromise({
        try: () => response.text(),
        catch: (error) => new Error(`Failed to read response for ${this.name}: ${error}`),
      });
    });
  }
}
