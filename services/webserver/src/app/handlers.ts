import type { RouteHandler, CacheOptions } from "../types";
import { getFromCache, setInCache } from "../utils/cache";

/**
 * Wraps a route handler with caching logic.
 * On the first request, it executes the handler, caches the response, and returns it.
 * On subsequent requests, it returns the cached response if it's still valid.
 */
export const defineCachedEventHandler = <R, E, A>(
  handler: RouteHandler<R, E, A>,
  options: CacheOptions,
): RouteHandler<R, E, A> => {
  return async (request, params) => {
    const cacheKey = new URL(request.url).pathname;

    // 1. Try to get from cache
    const cachedResponse = getFromCache(cacheKey);
    if (cachedResponse) {
      return cachedResponse as A;
    }

    // 2. Execute original handler
    const result = await handler(request, params);

    // 3. If the result is a Response, cache it
    if (result instanceof Response) {
      setInCache(cacheKey, result, options.maxAgeSeconds);
    }

    return result;
  };
};
