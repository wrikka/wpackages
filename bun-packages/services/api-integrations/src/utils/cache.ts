import type { CacheConfig, CacheEntry, CacheKey, CacheStats } from "../types";

/**
 * Cache utilities - Pure functions
 */

/**
 * Build cache key with namespace and prefix
 */
export const buildCacheKey = (key: CacheKey, config?: CacheConfig): string => {
	const parts: string[] = [];

	if (config?.keyPrefix) {
		parts.push(config.keyPrefix);
	}

	if (key.namespace) {
		parts.push(key.namespace);
	}

	parts.push(key.key);

	return parts.join(":");
};

/**
 * Check if cache entry is expired
 */
export const isCacheExpired = (entry: CacheEntry): boolean => {
	return Date.now() > entry.expiresAt;
};

/**
 * Calculate cache expiry time
 */
export const calculateExpiryTime = (ttl: number): number => {
	return Date.now() + ttl;
};

/**
 * Create cache entry
 */
export const createCacheEntry = <T>(
	key: string,
	value: T,
	ttl: number,
	metadata?: Record<string, unknown>,
): CacheEntry<T> => {
	const now = Date.now();
	const entry: CacheEntry<T> = {
		expiresAt: now + ttl,
		hits: 0,
		key,
		timestamp: now,
		value,
	};

	if (metadata) {
		return { ...entry, metadata };
	}

	return entry;
};

/**
 * Update cache entry hit count
 */
export const incrementHitCount = <T>(entry: CacheEntry<T>): CacheEntry<T> => ({
	...entry,
	hits: (entry.hits ?? 0) + 1,
});

/**
 * Calculate cache hit rate
 */
export const calculateHitRate = (hits: number, total: number): number => {
	if (total === 0) return 0;
	return Number((hits / total).toFixed(4));
};

/**
 * Build cache stats
 */
export const buildCacheStats = (
	hits: number,
	misses: number,
	size: number,
	evictions: number,
): CacheStats => ({
	evictions,
	hitRate: calculateHitRate(hits, hits + misses),
	hits,
	misses,
	size,
});

/**
 * Check if pattern matches key
 */
export const matchesPattern = (key: string, pattern: string): boolean => {
	const regexPattern = pattern.replace(/\*/g, ".*").replace(/\?/g, ".");

	const regex = new RegExp(`^${regexPattern}$`);
	return regex.test(key);
};

/**
 * Filter cache keys by pattern
 */
export const filterKeysByPattern = (
	keys: readonly string[],
	pattern: string,
): readonly string[] => {
	return keys.filter((key) => matchesPattern(key, pattern));
};

/**
 * Extract tags from cache key
 */
export const extractTags = (key: string): readonly string[] => {
	const tagMatch = key.match(/\[([^\]]+)\]/);
	return tagMatch?.[1] ? tagMatch[1].split(",").map((tag) => tag.trim()) : [];
};

/**
 * Build default cache config
 */
export const buildDefaultCacheConfig = (
	ttl: number,
	partial?: Partial<CacheConfig>,
): CacheConfig => ({
	strategy: "lru",
	ttl,
	...partial,
});
