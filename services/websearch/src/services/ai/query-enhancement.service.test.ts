import { describe, it, expect } from "vitest";
import { Effect } from "effect";
import { QueryEnhancementService } from "./query-enhancement.service";
import { SearchQuerySchema } from "../../types";

describe("QueryEnhancementService", () => {
  const service = new QueryEnhancementService();

  it("should enhance a basic query", () => {
    const query = SearchQuerySchema.parse({
      query: "typescript",
      engines: ["google"],
    });

    const result = Effect.runSync(service.enhance(query));
    expect(result.originalQuery).toBe("typescript");
    expect(result.enhancedQuery).toBeDefined();
    expect(result.suggestedQueries).toBeInstanceOf(Array);
  });

  it("should add explanation to non-question queries", () => {
    const query = SearchQuerySchema.parse({
      query: "react hooks",
      engines: ["google"],
    });

    const result = Effect.runSync(service.enhance(query));
    expect(result.enhancedQuery).toContain("explanation");
  });

  it("should generate suggested queries", () => {
    const query = SearchQuerySchema.parse({
      query: "typescript",
      engines: ["google"],
    });

    const result = Effect.runSync(service.enhance(query));
    expect(result.suggestedQueries.length).toBeGreaterThan(0);
    expect(result.suggestedQueries[0]).toContain("typescript");
  });

  it("should provide reasoning", () => {
    const query = SearchQuerySchema.parse({
      query: "typescript",
      engines: ["google"],
    });

    const result = Effect.runSync(service.enhance(query));
    expect(result.reasoning).toBeDefined();
  });
});
