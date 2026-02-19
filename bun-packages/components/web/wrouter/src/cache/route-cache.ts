import { createCache, memoize } from "@wpackages/cache";
import type { RouteMatch, RouteDataLoadResult } from "../types";

export interface RouteCacheOptions {
	readonly maxSize?: number;
	readonly ttl?: number;
	readonly lru?: boolean;
}

const defaultCacheOptions: RouteCacheOptions = {
	maxSize: 100,
	ttl: 5 * 60 * 1000, // 5 minutes
	lru: true,
};

export const createRouteCache = (options: RouteCacheOptions = {}) => {
	const opts = { ...defaultCacheOptions, ...options };
	return createCache<string, RouteMatch>({
		maxSize: opts.maxSize,
		ttl: opts.ttl,
		lru: opts.lru,
	});
};

export const createDataLoaderCache = <T>(options: RouteCacheOptions = {}) => {
	const opts = { ...defaultCacheOptions, ...options };
	return createCache<string, RouteDataLoadResult<T>>({
		maxSize: opts.maxSize,
		ttl: opts.ttl,
		lru: opts.lru,
	});
};

export const memoizeRouteMatch = (
	fn: (pathname: string) => RouteMatch | null,
	options: RouteCacheOptions = {},
) => {
	const cache = createRouteCache(options);

	return (pathname: string): RouteMatch | null => {
		const cached = cache.get(pathname);
		if (cached !== undefined) {
			return cached;
		}

		const result = fn(pathname);
		if (result) {
			cache.set(pathname, result);
		}
		return result;
	};
};

export const memoizeDataLoader = <T, Args extends readonly unknown[]>(
	fn: (...args: Args) => Promise<RouteDataLoadResult<T>>,
	options: RouteCacheOptions = {},
) => {
	const cache = createDataLoaderCache<T>(options);

	return async (...args: Args): Promise<RouteDataLoadResult<T>> => {
		const key = JSON.stringify(args);
		const cached = cache.get(key);
		if (cached !== undefined) {
			return cached;
		}

		const result = await fn(...args);
		cache.set(key, result);
		return result;
	};
};

export const createRouteMemoizer = <T extends (...args: readonly unknown[]) => unknown>(
	fn: T,
	options: RouteCacheOptions = {},
): T => {
	return memoize(fn, options) as T;
};
