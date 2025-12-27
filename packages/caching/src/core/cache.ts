/**
 * Core cache implementation with functional programming principles
 */

import { isExpired, normalizeConfig, updateAccessMetadata } from "../components/index";
import type { Cache, CacheConfig, CacheEntry, CacheStats } from "../types/cache.types";

// Internal cache implementation
export class FunctionalCache<K, V> implements Cache<K, V> {
	private readonly cache = new Map<K, CacheEntry<V>>();
	private readonly config: Required<CacheConfig>;
	private hits = 0;
	private misses = 0;
	private evictions = 0;

	constructor(config: CacheConfig = {}) {
		this.config = normalizeConfig(config);
	}

	/**
	 * Get a value from the cache
	 */
	get(key: K): V | undefined {
		const entry = this.cache.get(key);

		if (!entry) {
			this.misses++;
			return undefined;
		}

		// Check if entry has expired
		if (isExpired(entry)) {
			this.cache.delete(key);
			this.evictions++;
			this.misses++;
			return undefined;
		}

		// Update access metadata for LRU
		if (this.config.lru) {
			const updatedEntry = updateAccessMetadata(entry);
			this.cache.set(key, updatedEntry);
		}

		this.hits++;
		return entry.value;
	}

	/**
	 * Set a value in the cache
	 */
	set(key: K, value: V): void {
		const now = Date.now();
		const expiresAt = this.config.ttl > 0 ? now + this.config.ttl : null;

		// Check if we need to evict entries
		if (this.cache.size >= this.config.maxSize) {
			this.evict();
		}

		const entry: CacheEntry<V> = {
			value,
			createdAt: now,
			expiresAt,
			accessCount: 0,
			lastAccessed: 0, // Set to 0 so it's considered least recently used
		};

		this.cache.set(key, entry);
	}

	/**
	 * Check if a key exists in the cache
	 */
	has(key: K): boolean {
		return this.get(key) !== undefined;
	}

	/**
	 * Delete a key from the cache
	 */
	delete(key: K): boolean {
		return this.cache.delete(key);
	}

	/**
	 * Clear all entries from the cache
	 */
	clear(): void {
		this.cache.clear();
	}

	/**
	 * Get the current size of the cache
	 */
	size(): number {
		return this.cache.size;
	}

	/**
	 * Get cache statistics
	 */
	stats(): CacheStats {
		return {
			hits: this.hits,
			misses: this.misses,
			evictions: this.evictions,
			size: this.cache.size,
			maxSize: this.config.maxSize,
		};
	}

	/**
	 * Get all keys in the cache
	 */
	keys(): K[] {
		return Array.from(this.cache.keys());
	}

	/**
	 * Get all values in the cache
	 */
	values(): V[] {
		return Array.from(this.cache.values()).map(entry => entry.value);
	}

	/**
	 * Get all entries in the cache
	 */
	entries(): [K, V][] {
		return Array.from(this.cache.entries()).map(([key, entry]) => [key, entry.value]);
	}

	/**
	 * Evict entries based on LRU or FIFO policy
	 */
	private evict(): void {
		if (this.cache.size === 0) return;

		if (this.config.lru) {
			// Find the least recently used entry
			let lruKey: K | null = null;
			let lruTime = Infinity;

			for (const [key, entry] of this.cache.entries()) {
				if (entry.lastAccessed < lruTime) {
					lruTime = entry.lastAccessed;
					lruKey = key;
				}
			}

			if (lruKey !== null) {
				this.cache.delete(lruKey);
				this.evictions++;
			}
		} else {
			// FIFO eviction - remove the oldest entry
			const firstKey = this.cache.keys().next().value;
			if (firstKey !== undefined) {
				this.cache.delete(firstKey);
				this.evictions++;
			}
		}
	}
}

/**
 * Create a new cache instance
 */
export const createCache = <K, V>(config: CacheConfig = {}): Cache<K, V> => {
	return new FunctionalCache<K, V>(config);
};
