import { Effect } from "effect";
import { ResultSummary, SearchResult } from "../../types";

export class ResultSummarizationService {
  summarize(results: SearchResult[], maxLength: number = 1000, maxKeyPoints: number = 5): Effect.Effect<ResultSummary, Error> {
    if (results.length === 0) {
      return Effect.succeed({
        summary: "No results found.",
        keyPoints: [],
        topics: [],
        confidence: 0,
      });
    }

    const topResults = results.slice(0, 10);
    const summary = this.generateSummary(topResults, maxLength);
    const keyPoints = this.extractKeyPoints(topResults, maxKeyPoints);
    const topics = this.extractTopics(topResults);
    const confidence = this.calculateConfidence(results);

    return Effect.succeed({
      summary,
      keyPoints,
      topics,
      confidence,
    });
  }

  private generateSummary(results: SearchResult[], maxLength: number): string {
    const snippets = results.map((r) => r.snippet).join(" ");
    const words = snippets.split(/\s+/);

    if (words.length <= maxLength) {
      return snippets;
    }

    return words.slice(0, maxLength).join(" ") + "...";
  }

  private extractKeyPoints(results: SearchResult[], maxPoints: number): string[] {
    const keyPoints: string[] = [];

    for (const result of results) {
      const sentences = result.snippet.split(/[.!?]+/).filter((s) => s.trim().length > 10);

      for (const sentence of sentences) {
        if (keyPoints.length >= maxPoints) break;

        const trimmed = sentence.trim();
        if (!keyPoints.includes(trimmed)) {
          keyPoints.push(trimmed);
        }
      }
    }

    return keyPoints;
  }

  private extractTopics(results: SearchResult[]): string[] {
    const topicCounts = new Map<string, number>();

    for (const result of results) {
      const words = result.title.toLowerCase().split(/\s+/);
      for (const word of words) {
        if (word.length > 4) {
          topicCounts.set(word, (topicCounts.get(word) || 0) + 1);
        }
      }
    }

    const sorted = Array.from(topicCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([topic]) => topic);

    return sorted;
  }

  private calculateConfidence(results: SearchResult[]): number {
    if (results.length === 0) return 0;

    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    const uniqueDomains = new Set(results.map((r) => new URL(r.url).hostname)).size;
    const domainFactor = Math.min(1, uniqueDomains / 5);

    return Math.min(1, avgScore * 0.7 + domainFactor * 0.3);
  }
}
