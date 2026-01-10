import { SearchQuery } from "../types";

export const buildGoogleQuery = (query: SearchQuery): string => {
  let q = query.query;

  if (query.siteFilter) {
    q = `site:${query.siteFilter} ${q}`;
  }

  if (query.includeDomains.length > 0) {
    const domainFilter = query.includeDomains.map((d) => `site:${d}`).join(" OR ");
    q = `(${domainFilter}) ${q}`;
  }

  if (query.excludeDomains.length > 0) {
    const excludeFilter = query.excludeDomains.map((d) => `-site:${d}`).join(" ");
    q = `${q} ${excludeFilter}`;
  }

  switch (query.timeRange) {
    case "day":
      q = `${q} after:${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]}`;
      break;
    case "week":
      q = `${q} after:${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}`;
      break;
    case "month":
      q = `${q} after:${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}`;
      break;
    case "year":
      q = `${q} after:${new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}`;
      break;
  }

  return q;
};

export const buildBingQuery = (query: SearchQuery): string => {
  let q = query.query;

  if (query.siteFilter) {
    q = `site:${query.siteFilter} ${q}`;
  }

  if (query.includeDomains.length > 0) {
    const domainFilter = query.includeDomains.map((d) => `site:${d}`).join(" OR ");
    q = `(${domainFilter}) ${q}`;
  }

  if (query.excludeDomains.length > 0) {
    const excludeFilter = query.excludeDomains.map((d) => `-site:${d}`).join(" ");
    q = `${q} ${excludeFilter}`;
  }

  return q;
};

export const buildDuckDuckGoQuery = (query: SearchQuery): string => {
  let q = query.query;

  if (query.siteFilter) {
    q = `site:${query.siteFilter} ${q}`;
  }

  if (query.includeDomains.length > 0) {
    const domainFilter = query.includeDomains.map((d) => `site:${d}`).join(" OR ");
    q = `(${domainFilter}) ${q}`;
  }

  if (query.excludeDomains.length > 0) {
    const excludeFilter = query.excludeDomains.map((d) => `-site:${d}`).join(" ");
    q = `${q} ${excludeFilter}`;
  }

  return q;
};

export const buildBraveQuery = (query: SearchQuery): string => {
  let q = query.query;

  if (query.siteFilter) {
    q = `site:${query.siteFilter} ${q}`;
  }

  if (query.includeDomains.length > 0) {
    const domainFilter = query.includeDomains.map((d) => `site:${d}`).join(" OR ");
    q = `(${domainFilter}) ${q}`;
  }

  if (query.excludeDomains.length > 0) {
    const excludeFilter = query.excludeDomains.map((d) => `-site:${d}`).join(" ");
    q = `${q} ${excludeFilter}`;
  }

  return q;
};

export const buildQueryParams = (query: SearchQuery, engine: string): Record<string, string> => {
  const params: Record<string, string> = {
    q: query.query,
    hl: query.language,
    gl: query.region,
    num: query.numResults.toString(),
  };

  if (query.safeSearch) {
    params.safe = "active";
  }

  switch (engine) {
    case "google":
      params.q = buildGoogleQuery(query);
      break;
    case "bing":
      params.q = buildBingQuery(query);
      break;
    case "duckduckgo":
      params.q = buildDuckDuckGoQuery(query);
      break;
    case "brave":
      params.q = buildBraveQuery(query);
      break;
  }

  return params;
};
