import { Effect } from "effect";
import { SearchResult } from "../../types";

interface TopicCluster {
  name: string;
  results: SearchResult[];
  keywords: string[];
}

export class TopicClusteringService {
  cluster(results: SearchResult[], maxTopics: number = 10): Effect.Effect<TopicCluster[], Error> {
    if (results.length === 0) {
      return Effect.succeed([]);
    }

    const keywords = this.extractKeywords(results);
    const clusters = this.buildClusters(results, keywords, maxTopics);

    return Effect.succeed(clusters);
  }

  private extractKeywords(results: SearchResult[]): Map<string, number> {
    const keywordCounts = new Map<string, number>();

    for (const result of results) {
      const text = `${result.title} ${result.snippet}`.toLowerCase();
      const words = text.split(/\s+/);

      for (const word of words) {
        if (word.length > 3 && !this.isStopWord(word)) {
          keywordCounts.set(word, (keywordCounts.get(word) || 0) + 1);
        }
      }
    }

    return keywordCounts;
  }

  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      "the",
      "and",
      "for",
      "are",
      "but",
      "not",
      "you",
      "all",
      "can",
      "had",
      "her",
      "was",
      "one",
      "our",
      "out",
      "has",
      "have",
      "been",
      "with",
      "they",
      "this",
      "that",
      "from",
      "will",
      "would",
      "there",
      "their",
      "what",
      "about",
      "which",
      "when",
      "make",
      "like",
      "into",
      "year",
      "your",
      "just",
      "over",
      "also",
      "such",
      "because",
      "these",
      "first",
      "being",
      "most",
    ]);

    return stopWords.has(word);
  }

  private buildClusters(results: SearchResult[], keywords: Map<string, number>, maxTopics: number): TopicCluster[] {
    const topKeywords = Array.from(keywords.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxTopics)
      .map(([keyword]) => keyword);

    const clusters: TopicCluster[] = [];
    const assigned = new Set<SearchResult>();

    for (const keyword of topKeywords) {
      const matchingResults: SearchResult[] = [];

      for (const result of results) {
        if (assigned.has(result)) continue;

        const text = `${result.title} ${result.snippet}`.toLowerCase();
        if (text.includes(keyword)) {
          matchingResults.push(result);
          assigned.add(result);
        }
      }

      if (matchingResults.length > 0) {
        clusters.push({
          name: keyword,
          results: matchingResults,
          keywords: this.getClusterKeywords(matchingResults, keywords),
        });
      }
    }

    const unassigned = results.filter((r) => !assigned.has(r));
    if (unassigned.length > 0) {
      clusters.push({
        name: "other",
        results: unassigned,
        keywords: [],
      });
    }

    return clusters;
  }

  private getClusterKeywords(results: SearchResult[], globalKeywords: Map<string, number>): string[] {
    const clusterKeywords = new Map<string, number>();

    for (const result of results) {
      const text = `${result.title} ${result.snippet}`.toLowerCase();
      const words = text.split(/\s+/);

      for (const word of words) {
        if (globalKeywords.has(word) && !this.isStopWord(word)) {
          clusterKeywords.set(word, (clusterKeywords.get(word) || 0) + 1);
        }
      }
    }

    return Array.from(clusterKeywords.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([keyword]) => keyword);
  }
}
