import { Effect } from "effect";
import { SearchHistory, SearchHistoryEntry, SearchHistorySchema } from "../types";

export class SearchHistoryService {
  private history: SearchHistory;

  constructor(maxSize: number = 100) {
    this.history = {
      entries: [],
      maxSize,
    };
  }

  addEntry(entry: SearchHistoryEntry): Effect.Effect<void, Error> {
    return Effect.sync(() => {
      this.history.entries.unshift(entry);

      if (this.history.entries.length > this.history.maxSize) {
        this.history.entries = this.history.entries.slice(0, this.history.maxSize);
      }
    });
  }

  getHistory(limit?: number): Effect.Effect<SearchHistoryEntry[], Error> {
    return Effect.sync(() => {
      if (limit) {
        return this.history.entries.slice(0, limit);
      }
      return [...this.history.entries];
    });
  }

  getRecentQueries(limit: number = 10): Effect.Effect<string[], Error> {
    return Effect.sync(() => {
      return this.history.entries.slice(0, limit).map((e) => e.query);
    });
  }

  clearHistory(): Effect.Effect<void, Error> {
    return Effect.sync(() => {
      this.history.entries = [];
    });
  }

  getHistoryByQuery(query: string): Effect.Effect<SearchHistoryEntry[], Error> {
    return Effect.sync(() => {
      return this.history.entries.filter((e) => e.query.toLowerCase().includes(query.toLowerCase()));
    });
  }

  getHistoryByEngine(engine: string): Effect.Effect<SearchHistoryEntry[], Error> {
    return Effect.sync(() => {
      return this.history.entries.filter((e) => e.enginesUsed.includes(engine));
    });
  }

  getStats(): Effect.Effect<{ total: number; uniqueQueries: number; averageResults: number; averageTime: number }, Error> {
    return Effect.sync(() => {
      const total = this.history.entries.length;
      const uniqueQueries = new Set(this.history.entries.map((e) => e.query)).size;
      const averageResults =
        total > 0 ? this.history.entries.reduce((sum, e) => sum + e.resultsCount, 0) / total : 0;
      const averageTime = total > 0 ? this.history.entries.reduce((sum, e) => sum + e.searchTime, 0) / total : 0;

      return { total, uniqueQueries, averageResults, averageTime };
    });
  }

  toJSON(): SearchHistory {
    return SearchHistorySchema.parse(this.history);
  }

  fromJSON(data: unknown): Effect.Effect<void, Error> {
    return Effect.try(() => {
      this.history = SearchHistorySchema.parse(data);
    });
  }
}
