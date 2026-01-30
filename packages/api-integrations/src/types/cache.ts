type ResultType<T, E> =
	| { success: true; value: T }
	| { success: false; error: E };

/**
 * Cache configuration
 */
export type CacheConfig = {
	readonly ttl: number;
	readonly maxSize?: number;
	readonly strategy: CacheStrategy;
	readonly keyPrefix?: string;
	readonly namespace?: string;
};

/**
 * Cache strategies
 */
export type CacheStrategy = "memory" | "lru" | "lfu" | "fifo";

/**
 * Cache entry
 */
export type CacheEntry<T = unknown> = {
	readonly key: string;
	readonly value: T;
	readonly timestamp: number;
	readonly expiresAt: number;
	readonly hits?: number;
	readonly metadata?: Record<string, unknown>;
};

/**
 * Cache key
 */
export type CacheKey = {
	readonly namespace?: string;
	readonly key: string;
	readonly tags?: readonly string[];
};

/**
 * Cache statistics
 */
export type CacheStats = {
	readonly hits: number;
	readonly misses: number;
	readonly size: number;
	readonly hitRate: number;
	readonly evictions: number;
};

/**
 * Cache operation result
 */
export type CacheResult<T> = ResultType<T, CacheError>;

/**
 * Cache error
 */
export type CacheError = {
	readonly type: "cache";
	readonly message: string;
	readonly operation: "get" | "set" | "delete" | "clear";
	readonly key?: string;
};

/**
 * Cache store interface
 */
export type CacheStore<T = unknown> = {
	readonly get: (key: string) => Promise<CacheResult<T | undefined>>;
	readonly set: (
		key: string,
		value: T,
		ttl?: number,
	) => Promise<CacheResult<void>>;
	readonly delete: (key: string) => Promise<CacheResult<boolean>>;
	readonly clear: () => Promise<CacheResult<void>>;
	readonly has: (key: string) => Promise<boolean>;
	readonly stats: () => CacheStats;
};

/**
 * Cache invalidation options
 */
export type CacheInvalidationOptions = {
	readonly pattern?: string;
	readonly tags?: readonly string[];
	readonly olderThan?: number;
};
