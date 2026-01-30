/**
 * Cache constants
 */

/**
 * Default cache TTL (5 minutes)
 */
export const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

/**
 * Short cache TTL (1 minute)
 */
export const SHORT_CACHE_TTL = 60 * 1000;

/**
 * Medium cache TTL (15 minutes)
 */
export const MEDIUM_CACHE_TTL = 15 * 60 * 1000;

/**
 * Long cache TTL (1 hour)
 */
export const LONG_CACHE_TTL = 60 * 60 * 1000;

/**
 * Very long cache TTL (24 hours)
 */
export const VERY_LONG_CACHE_TTL = 24 * 60 * 60 * 1000;

/**
 * Default cache max size
 */
export const DEFAULT_CACHE_MAX_SIZE = 1000;

/**
 * Cache strategies
 */
export const CACHE_STRATEGIES = {
	FIFO: "fifo",
	LFU: "lfu",
	LRU: "lru",
	MEMORY: "memory",
} as const;

/**
 * Cache key separators
 */
export const CACHE_KEY_SEPARATOR = ":";
export const CACHE_TAG_START = "[";
export const CACHE_TAG_END = "]";
