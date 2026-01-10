import { describe, it, expect } from "vitest";
import { Effect } from "effect";
import { ResultSummarizationService } from "./result-summarization.service";
import { SearchResultSchema } from "../../types";

describe("ResultSummarizationService", () => {
  const service = new ResultSummarizationService();

  it("should summarize empty results", () => {
    const result = Effect.runSync(service.summarize([], 1000, 5));
    expect(result.summary).toBe("No results found.");
    expect(result.keyPoints).toEqual([]);
    expect(result.topics).toEqual([]);
    expect(result.confidence).toBe(0);
  });

  it("should summarize results", () => {
    const results = [
      SearchResultSchema.parse({
        title: "Test 1",
        url: "https://example.com/1",
        snippet: "This is a test snippet about testing",
        score: 0.8,
        engine: "google",
      }),
      SearchResultSchema.parse({
        title: "Test 2",
        url: "https://example.com/2",
        snippet: "Another test snippet",
        score: 0.7,
        engine: "bing",
      }),
    ];

    const result = Effect.runSync(service.summarize(results, 1000, 5));
    expect(result.summary).toBeDefined();
    expect(result.summary.length).toBeGreaterThan(0);
    expect(result.keyPoints).toBeInstanceOf(Array);
    expect(result.topics).toBeInstanceOf(Array);
    expect(result.confidence).toBeGreaterThan(0);
  });

  it("should limit summary length", () => {
    const results = [
      SearchResultSchema.parse({
        title: "Test",
        url: "https://example.com",
        snippet: "a".repeat(2000),
        score: 0.5,
        engine: "google",
      }),
    ];

    const result = Effect.runSync(service.summarize(results, 100, 5));
    expect(result.summary.length).toBeLessThanOrEqual(103);
  });

  it("should extract key points", () => {
    const results = [
      SearchResultSchema.parse({
        title: "Test",
        url: "https://example.com",
        snippet: "First point. Second point. Third point.",
        score: 0.5,
        engine: "google",
      }),
    ];

    const result = Effect.runSync(service.summarize(results, 1000, 5));
    expect(result.keyPoints.length).toBeGreaterThan(0);
  });

  it("should calculate confidence based on scores", () => {
    const highScoreResults = [
      SearchResultSchema.parse({
        title: "Test",
        url: "https://example1.com",
        snippet: "Test",
        score: 0.9,
        engine: "google",
      }),
      SearchResultSchema.parse({
        title: "Test",
        url: "https://example2.com",
        snippet: "Test",
        score: 0.8,
        engine: "bing",
      }),
    ];

    const highConfidence = Effect.runSync(service.summarize(highScoreResults, 1000, 5));

    const lowScoreResults = [
      SearchResultSchema.parse({
        title: "Test",
        url: "https://example.com",
        snippet: "Test",
        score: 0.3,
        engine: "google",
      }),
    ];

    const lowConfidence = Effect.runSync(service.summarize(lowScoreResults, 1000, 5));

    expect(highConfidence.confidence).toBeGreaterThan(lowConfidence.confidence);
  });
});
