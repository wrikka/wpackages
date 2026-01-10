import { SearchResult, SearchQuery } from "../types";

export const scoreResults = (results: SearchResult[], query: SearchQuery): SearchResult[] => {
  const queryTerms = query.query.toLowerCase().split(/\s+/);

  return results.map((result) => {
    let score = 0.5;

    const titleLower = result.title.toLowerCase();
    const snippetLower = result.snippet.toLowerCase();

    for (const term of queryTerms) {
      if (titleLower.includes(term)) {
        score += 0.15;
      }
      if (snippetLower.includes(term)) {
        score += 0.1;
      }
    }

    if (titleLower.includes(query.query.toLowerCase())) {
      score += 0.2;
    }

    const domain = extractDomain(result.url);
    if (query.includeDomains.includes(domain)) {
      score += 0.3;
    }

    if (query.excludeDomains.includes(domain)) {
      score -= 0.5;
    }

    if (result.publishedDate) {
      const age = Date.now() - new Date(result.publishedDate).getTime();
      if (age < 24 * 60 * 60 * 1000) {
        score += 0.1;
      } else if (age < 7 * 24 * 60 * 60 * 1000) {
        score += 0.05;
      }
    }

    return {
      ...result,
      score: Math.min(1, Math.max(0, score)),
    };
  });
};

const extractDomain = (url: string): string => {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
};

export const sortByScore = (results: SearchResult[]): SearchResult[] => {
  return [...results].sort((a, b) => b.score - a.score);
};
