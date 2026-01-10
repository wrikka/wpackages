import { Effect } from "effect";
import { SearchCategory, SearchQuery, SearchResult } from "../types";

export class CategorySearchService {
  searchByCategory(query: SearchQuery, category: SearchCategory): Effect.Effect<SearchResult[], Error> {
    switch (category) {
      case "github":
        return this.searchGitHub(query);
      case "research":
        return this.searchResearch(query);
      case "mixed":
        return this.searchMixed(query);
      case "general":
      default:
        return Effect.succeed([]);
    }
  }

  private searchGitHub(_query: SearchQuery): Effect.Effect<SearchResult[], Error> {
    return Effect.sync(() => {
      return [];
    });
  }

  private searchResearch(_query: SearchQuery): Effect.Effect<SearchResult[], Error> {
    return Effect.sync(() => {
      return [];
    });
  }

  private searchMixed(_query: SearchQuery): Effect.Effect<SearchResult[], Error> {
    return Effect.sync(() => {
      return [];
    });
  }
}
