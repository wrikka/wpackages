/**
 * Core cache implementation with functional programming principles
 */

import { updateAccessMetadata } from "../components/cache-utils";
import type { Cache, CacheConfig, CacheEntry, CacheStats } from "../types/cache.types";

/**
 * Create a new cache instance using design patterns
 */
export const createCache = <K extends string | number, V>(config: CacheConfig = {}): Cache<K, V> => {
	const maxSize = config.maxSize ?? Infinity;
	const ttl = config.ttl ?? 0;
	const useLru = config.lru ?? false;

	const cache = new Map<K, CacheEntry<V>>();

	let hits = 0;
	let misses = 0;
	let evictions = 0;

	const isExpiredEntry = (entry: CacheEntry<V>): boolean => {
		if (entry.expiresAt === null) {
			return false;
		}
		return Date.now() > entry.expiresAt;
	};

	const pruneExpired = (): void => {
		for (const [key, entry] of cache.entries()) {
			if (isExpiredEntry(entry)) {
				cache.delete(key);
			}
		}
	};

	const selectEvictionKey = (): K | undefined => {
		let selectedKey: K | undefined;
		let selectedScore: number | undefined;

		for (const [key, entry] of cache.entries()) {
			const score = useLru ? entry.lastAccessed : entry.createdAt;
			if (selectedScore === undefined || score < selectedScore) {
				selectedScore = score;
				selectedKey = key;
			}
		}

		return selectedKey;
	};

	const setFn = (key: K, value: V): void => {
		pruneExpired();

		if (!cache.has(key) && cache.size >= maxSize) {
			const evictionKey = selectEvictionKey();
			if (evictionKey !== undefined) {
				cache.delete(evictionKey);
				evictions++;
			}
		}

		const now = Date.now();
		const expiresAt = ttl > 0 ? now + ttl : null;
		const entry: CacheEntry<V> = {
			value,
			expiresAt,
			createdAt: now,
			accessCount: 0,
			lastAccessed: now,
		};

		cache.set(key, entry);
	};

	const getFn = (key: K): V | undefined => {
		const entry = cache.get(key);
		if (entry === undefined) {
			misses++;
			return undefined;
		}

		if (isExpiredEntry(entry)) {
			cache.delete(key);
			misses++;
			return undefined;
		}

		hits++;
		const updated = updateAccessMetadata(entry);
		cache.set(key, updated);
		return updated.value;
	};

	const hasFn = (key: K): boolean => {
		const entry = cache.get(key);
		if (entry === undefined) {
			return false;
		}
		if (isExpiredEntry(entry)) {
			cache.delete(key);
			return false;
		}
		return true;
	};

	const deleteFn = (key: K): boolean => {
		return cache.delete(key);
	};

	const clearFn = (): void => {
		cache.clear();
	};

	const sizeFn = (): number => {
		pruneExpired();
		return cache.size;
	};

	const statsFn = (): CacheStats => {
		pruneExpired();
		return {
			hits,
			misses,
			evictions,
			size: cache.size,
			maxSize,
		};
	};

	const keysFn = (): K[] => {
		pruneExpired();
		return Array.from(cache.keys());
	};

	const valuesFn = (): V[] => {
		pruneExpired();
		return Array.from(cache.values()).map(entry => entry.value);
	};

	const entriesFn = (): [K, V][] => {
		pruneExpired();
		return Array.from(cache.entries()).map(([key, entry]) => [key, entry.value]);
	};

	return {
		get: getFn,
		set: setFn,
		has: hasFn,
		delete: deleteFn,
		clear: clearFn,
		size: sizeFn,
		stats: statsFn,
		keys: keysFn,
		values: valuesFn,
		entries: entriesFn,
	};
};
