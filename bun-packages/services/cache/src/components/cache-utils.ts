/**
 * Pure cache utilities for functional composition
 */

import { CACHE_CONSTANTS } from "../constant/cache.const";
import type { CacheConfig, CacheEntry } from "../types/cache.types";

/**
 * Normalize cache configuration with defaults
 */
export const normalizeConfig = (config: CacheConfig = {}): Required<CacheConfig> => ({
	maxSize: config.maxSize ?? CACHE_CONSTANTS.DEFAULT_MAX_SIZE,
	ttl: config.ttl ?? CACHE_CONSTANTS.DEFAULT_TTL,
	lru: config.lru ?? false,
});

/**
 * Check if a cache entry has expired
 */
export const isExpired = <T>(entry: CacheEntry<T> | undefined): boolean => {
	if (!entry || entry.expiresAt === null) {
		return false;
	}
	return Date.now() > entry.expiresAt;
};

/**
 * Create a cache key from function arguments
 */
export const createKey = (...args: any[]): string => {
	try {
		return JSON.stringify(args);
	} catch {
		// Fallback for non-serializable arguments
		return args.map(arg => String(arg)).join("|");
	}
};

/**
 * Update cache entry access metadata for LRU
 */
export const updateAccessMetadata = <T>(entry: CacheEntry<T>): CacheEntry<T> => ({
	...entry,
	accessCount: entry.accessCount + 1,
	lastAccessed: Date.now(),
});
