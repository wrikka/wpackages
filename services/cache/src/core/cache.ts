/**
 * Core cache implementation with functional programming principles
 */

import { patterns } from "@w/design-pattern";
import type { Cache, CacheConfig, CacheStats } from "../types/cache.types";

const { createCachedFnWithTTL } = patterns.creational.cacheFactory;

/**
 * Create a new cache instance using design patterns
 */
export const createCache = <K extends string | number, V>(config: CacheConfig = {}): Cache<K, V> => {
	const cache = new Map<K, V>();

	const getFn = (key: K): V | undefined => cache.get(key);
	const setFn = (key: K, value: V): void => {
		if (config.maxSize && cache.size >= config.maxSize && !cache.has(key)) {
			const firstKey = cache.keys().next().value as K | undefined;
			if (firstKey !== undefined) {
				cache.delete(firstKey);
			}
		}
		cache.set(key, value);
	};

	let finalGet = getFn;

	if (config.ttl) {
		finalGet = createCachedFnWithTTL(getFn, config.ttl);
	}

	if (config.maxSize) {
		return {
			get: finalGet,
			set: setFn,
			has: (key: K) => cache.has(key),
			delete: (key: K) => cache.delete(key),
			clear: () => cache.clear(),
			size: () => cache.size,
			stats: (): CacheStats => ({
				hits: 0, // Note: stats are not fully supported with this simplified implementation
				misses: 0,
				evictions: 0,
				size: cache.size,
				maxSize: config.maxSize ?? Infinity,
			}),
			keys: () => Array.from(cache.keys()),
			values: () => Array.from(cache.values()),
			entries: () => Array.from(cache.entries()),
		};
	}

	return {
		get: finalGet,
		set: setFn,
		has: (key: K) => cache.has(key),
		delete: (key: K) => cache.delete(key),
		clear: () => cache.clear(),
		size: () => cache.size,
		stats: (): CacheStats => ({
			hits: 0,
			misses: 0,
			evictions: 0,
			size: cache.size,
			maxSize: config.maxSize ?? Infinity,
		}),
		keys: () => Array.from(cache.keys()),
		values: () => Array.from(cache.values()),
		entries: () => Array.from(cache.entries()),
	};
};
