/**
 * Advanced caching utilities
 */

import { createKey } from "../components/cache-utils";
import { createCache } from "../core/cache";
import type { CacheConfig } from "../types/cache.types";

/**
 * Create a cache with automatic key generation
 */
export const createAutoKeyCache = <T extends (...args: any[]) => any>(
	fn: T,
	config: CacheConfig = {},
) => {
	const cache = createCache<string, ReturnType<T>>(config);

	return (...args: Parameters<T>): ReturnType<T> => {
		const key = createKey(args);
		const cached = cache.get(key);

		if (cached !== undefined) {
			return cached;
		}

		const result = fn(...args);
		cache.set(key, result);
		return result;
	};
};

/**
 * Create a cache with TTL based on function result
 */
export const createTTLCache = <T extends (...args: any[]) => any>(
	fn: T,
	ttlFn: (result: ReturnType<T>) => number,
	config: CacheConfig = {},
) => {
	const cache = createCache<string, { value: ReturnType<T>; ttl: number }>(config);

	return (...args: Parameters<T>): ReturnType<T> => {
		const key = createKey(args);
		const cached = cache.get(key);

		if (cached && Date.now() < cached.ttl) {
			return cached.value;
		}

		const result = fn(...args);
		const ttl = Date.now() + ttlFn(result);
		cache.set(key, { value: result, ttl });
		return result;
	};
};

/**
 * Create a cache with retry mechanism
 */
export const createRetryCache = <T extends (...args: any[]) => any>(
	fn: T,
	maxRetries: number = 3,
	config: CacheConfig = {},
) => {
	const cache = createCache<string, ReturnType<T>>(config);

	return (...args: Parameters<T>): ReturnType<T> => {
		const key = createKey(args);
		const cached = cache.get(key);

		if (cached !== undefined) {
			return cached;
		}

		let retries = 0;
		let lastError: any;

		while (retries <= maxRetries) {
			try {
				const result = fn(...args);
				cache.set(key, result);
				return result;
			} catch (error) {
				lastError = error;
				retries++;
			}
		}

		throw new Error(`Max retries exceeded: ${lastError}`);
	};
};
