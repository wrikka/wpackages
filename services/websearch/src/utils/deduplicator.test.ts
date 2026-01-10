import { describe, it, expect } from "vitest";
import { deduplicateResults } from "./deduplicator";
import { SearchResultSchema } from "../types";

describe("Deduplicator", () => {
  it("should remove duplicate results by URL", () => {
    const results = [
      SearchResultSchema.parse({
        title: "Test 1",
        url: "https://example.com/page",
        snippet: "Snippet 1",
        score: 0.5,
        engine: "google",
      }),
      SearchResultSchema.parse({
        title: "Test 2",
        url: "https://example.com/page?param=value",
        snippet: "Snippet 2",
        score: 0.6,
        engine: "bing",
      }),
    ];

    const deduplicated = deduplicateResults(results);
    expect(deduplicated).toHaveLength(1);
    expect(deduplicated[0].score).toBe(0.6);
  });

  it("should limit results per domain", () => {
    const results = [
      SearchResultSchema.parse({
        title: "Test 1",
        url: "https://example.com/page1",
        snippet: "Snippet 1",
        score: 0.5,
        engine: "google",
      }),
      SearchResultSchema.parse({
        title: "Test 2",
        url: "https://example.com/page2",
        snippet: "Snippet 2",
        score: 0.5,
        engine: "google",
      }),
      SearchResultSchema.parse({
        title: "Test 3",
        url: "https://example.com/page3",
        snippet: "Snippet 3",
        score: 0.5,
        engine: "google",
      }),
      SearchResultSchema.parse({
        title: "Test 4",
        url: "https://example.com/page4",
        snippet: "Snippet 4",
        score: 0.5,
        engine: "google",
      }),
    ];

    const deduplicated = deduplicateResults(results);
    expect(deduplicated.length).toBeLessThanOrEqual(3);
  });

  it("should keep unique results", () => {
    const results = [
      SearchResultSchema.parse({
        title: "Test 1",
        url: "https://example1.com/page",
        snippet: "Snippet 1",
        score: 0.5,
        engine: "google",
      }),
      SearchResultSchema.parse({
        title: "Test 2",
        url: "https://example2.com/page",
        snippet: "Snippet 2",
        score: 0.5,
        engine: "bing",
      }),
    ];

    const deduplicated = deduplicateResults(results);
    expect(deduplicated).toHaveLength(2);
  });
});
