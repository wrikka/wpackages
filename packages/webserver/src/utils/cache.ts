interface CacheEntry {
  response: Response;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

export const getFromCache = (key: string): Response | null => {
  const entry = cache.get(key);
  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  // Return a clone of the response to avoid issues with a response body being consumed multiple times
  return entry.response.clone();
};

export const setInCache = (key: string, response: Response, maxAgeSeconds: number): void => {
  const expiresAt = Date.now() + maxAgeSeconds * 1000;
  cache.set(key, { response: response.clone(), expiresAt });
};
