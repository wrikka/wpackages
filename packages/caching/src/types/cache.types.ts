export interface CacheEntry<T> {
	value: T;
	expiresAt: number | null;
	createdAt: number;
	accessCount: number;
	lastAccessed: number;
}

export interface CacheConfig {
	maxSize?: number;
	ttl?: number;
	lru?: boolean;
}

export interface CacheStats {
	hits: number;
	misses: number;
	evictions: number;
	size: number;
	maxSize: number;
}

export interface Cache<K, V> {
	get(key: K): V | undefined;
	set(key: K, value: V): void;
	has(key: K): boolean;
	delete(key: K): boolean;
	clear(): void;
	size(): number;
	stats(): CacheStats;
	keys(): K[];
	values(): V[];
	entries(): [K, V][];
}

export interface CacheStorage {
	get<T>(key: string): Promise<CacheEntry<T> | undefined>;
	set<T>(key: string, value: CacheEntry<T>): Promise<void>;
	delete(key: string): Promise<void>;
	clear(): Promise<void>;
}

export type { Result } from "functional";
