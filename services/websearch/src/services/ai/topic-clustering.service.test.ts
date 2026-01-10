import { describe, it, expect } from "vitest";
import { Effect } from "effect";
import { TopicClusteringService } from "./topic-clustering.service";
import { SearchResultSchema } from "../../types";

describe("TopicClusteringService", () => {
  const service = new TopicClusteringService();

  it("should cluster empty results", () => {
    const result = Effect.runSync(service.cluster([], 10));
    expect(result).toEqual([]);
  });

  it("should cluster results by topic", () => {
    const results = [
      SearchResultSchema.parse({
        title: "TypeScript Tutorial",
        url: "https://example.com/1",
        snippet: "Learn TypeScript basics",
        score: 0.8,
        engine: "google",
      }),
      SearchResultSchema.parse({
        title: "TypeScript Guide",
        url: "https://example.com/2",
        snippet: "Complete TypeScript guide",
        score: 0.7,
        engine: "bing",
      }),
      SearchResultSchema.parse({
        title: "React Tutorial",
        url: "https://example.com/3",
        snippet: "Learn React basics",
        score: 0.8,
        engine: "google",
      }),
    ];

    const result = Effect.runSync(service.cluster(results, 10));
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].name).toBeDefined();
    expect(result[0].results).toBeInstanceOf(Array);
    expect(result[0].keywords).toBeInstanceOf(Array);
  });

  it("should limit number of topics", () => {
    const results = Array.from({ length: 20 }, (_, i) =>
      SearchResultSchema.parse({
        title: `Test ${i}`,
        url: `https://example.com/${i}`,
        snippet: `Snippet ${i}`,
        score: 0.5,
        engine: "google",
      }),
    );

    const result = Effect.runSync(service.cluster(results, 5));
    expect(result.length).toBeLessThanOrEqual(5);
  });

  it("should create keywords for clusters", () => {
    const results = [
      SearchResultSchema.parse({
        title: "TypeScript Tutorial",
        url: "https://example.com/1",
        snippet: "Learn TypeScript",
        score: 0.8,
        engine: "google",
      }),
    ];

    const result = Effect.runSync(service.cluster(results, 10));
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].keywords).toBeInstanceOf(Array);
  });
});
