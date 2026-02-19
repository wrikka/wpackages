/**
 * Cache service for handling side effects
 */

import type { Cache, CacheConfig, CacheStats } from "../types/cache.types";
import { createCache as createCacheCore } from "../utils/cache";

/**
 * Service for cache operations with error handling
 */
export class CacheService<K extends string | number, V> {
	private readonly cache: Cache<K, V>;

	constructor(config: CacheConfig = {}) {
		this.cache = createCacheCore(config);
	}

	/**
	 * Get a value from the cache
	 */
	get(key: K): V | undefined {
		return this.cache.get(key);
	}

	/**
	 * Set a value in the cache
	 */
	set(key: K, value: V): void {
		this.cache.set(key, value);
	}

	/**
	 * Delete a key from the cache
	 */
	delete(key: K): boolean {
		return this.cache.delete(key);
	}

	/**
	 * Get cache statistics
	 */
	stats(): CacheStats {
		return this.cache.stats();
	}

	/**
	 * Clear all entries from the cache
	 */
	clear(): void {
		this.cache.clear();
	}
}
