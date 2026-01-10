import { describe, it, expect } from "vitest";
import { Effect } from "effect";
import { WebSearchApp } from "./app";
import { SearchQuerySchema } from "./types";

describe("WebSearchApp", () => {
  it("should create app with default config", () => {
    const app = new WebSearchApp();
    expect(app).toBeDefined();
  });

  it("should create app with custom config", () => {
    const app = new WebSearchApp({
      engines: {
        google: {
          enabled: true,
          priority: 10,
          baseUrl: "https://www.google.com/search",
          userAgent: "test",
          timeout: 5000,
          maxRetries: 2,
          retryDelay: 500,
        },
      },
    });
    expect(app).toBeDefined();
  });

  it("should parse string query", () => {
    const app = new WebSearchApp();
    const result = Effect.runSync(app.search("test query"));
    expect(result.query).toBe("test query");
  });

  it("should parse SearchQuery object", () => {
    const app = new WebSearchApp();
    const query = SearchQuerySchema.parse({
      query: "test",
      engines: ["google"],
    });
    const result = Effect.runSync(app.search(query));
    expect(result.query).toBe("test");
  });

  it("should enhance query", () => {
    const app = new WebSearchApp();
    const query = SearchQuerySchema.parse({
      query: "test",
      engines: ["google"],
    });
    const result = Effect.runSync(app.search(query));
    expect(result.enhancement).toBeDefined();
    expect(result.enhancement.originalQuery).toBe("test");
  });

  it("should have extractContent method", () => {
    const app = new WebSearchApp();
    expect(app.extractContent).toBeDefined();
  });

  it("should have extractContentBatch method", () => {
    const app = new WebSearchApp();
    expect(app.extractContentBatch).toBeDefined();
  });

  it("should have enhanceQuery method", () => {
    const app = new WebSearchApp();
    expect(app.enhanceQuery).toBeDefined();
  });

  it("should have summarizeResults method", () => {
    const app = new WebSearchApp();
    expect(app.summarizeResults).toBeDefined();
  });

  it("should have clusterResults method", () => {
    const app = new WebSearchApp();
    expect(app.clusterResults).toBeDefined();
  });
});
