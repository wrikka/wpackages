/**
 * Cache constants and default configuration
 */

export const CACHE_CONSTANTS = {
	DEFAULT_MAX_SIZE: Infinity,
	DEFAULT_TTL: 0,
	MIN_TTL: 1,
	MAX_TTL: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
} as const;

export const DEFAULT_CACHE_CONFIG = {
	maxSize: CACHE_CONSTANTS.DEFAULT_MAX_SIZE,
	ttl: CACHE_CONSTANTS.DEFAULT_TTL,
	lru: false,
} as const;
