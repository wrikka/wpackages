export type CacheStrategy = "memory" | "disk" | "hybrid";

export interface CacheOptions {
	readonly strategy: CacheStrategy;
	readonly ttl?: number;
	readonly maxSize?: number;
	readonly cacheDir?: string;
	readonly persistToDisk?: boolean;
}

export interface CacheEntry<T = unknown> {
	readonly key: string;
	readonly value: T;
	readonly createdAt: Date;
	readonly expiresAt?: Date;
	readonly accessCount: number;
	readonly lastAccessedAt: Date;
}

export interface CacheStats {
	readonly hits: number;
	readonly misses: number;
	readonly size: number;
	readonly evictionCount: number;
}

export interface CacheManager<T = unknown> {
	readonly get: (key: string) => Promise<T | undefined>;
	readonly set: (key: string, value: T, ttl?: number) => Promise<void>;
	readonly delete: (key: string) => Promise<void>;
	readonly clear: () => Promise<void>;
	readonly has: (key: string) => Promise<boolean>;
	readonly getStats: () => CacheStats;
	readonly getEntry: (key: string) => Promise<CacheEntry<T> | undefined>;
	readonly invalidate: (pattern?: string) => Promise<void>;
}
