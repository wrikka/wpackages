import { SearchResult } from "../types";

export const deduplicateResults = (results: SearchResult[]): SearchResult[] => {
  const seen = new Map<string, SearchResult>();
  const domainCount = new Map<string, number>();

  for (const result of results) {
    const normalizedUrl = normalizeUrl(result.url);
    const domain = extractDomain(result.url);

    if (!seen.has(normalizedUrl)) {
      seen.set(normalizedUrl, result);
      domainCount.set(domain, (domainCount.get(domain) || 0) + 1);
    } else {
      const existing = seen.get(normalizedUrl)!;
      if (result.score > existing.score) {
        seen.set(normalizedUrl, result);
      }
    }
  }

  const deduplicated = Array.from(seen.values());

  return deduplicated.filter((result) => {
    const domain = extractDomain(result.url);
    return (domainCount.get(domain) || 0) <= 3;
  });
};

const normalizeUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    parsed.searchParams.sort();
    return parsed.toString();
  } catch {
    return url;
  }
};

const extractDomain = (url: string): string => {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
};
