import type {
	CacheEntry,
	CacheManager,
	CacheOptions,
	CacheStats,
} from "../types/cache.types";

export const createCacheManager = <T = unknown>(
	options: CacheOptions = { strategy: "memory" },
): CacheManager<T> => {
	const cache: Map<string, CacheEntry<T>> = new Map();
	let stats: CacheStats = {
		hits: 0,
		misses: 0,
		size: 0,
		evictionCount: 0,
	};

	const isExpired = (entry: CacheEntry<T>): boolean => {
		return entry.expiresAt ? entry.expiresAt < new Date() : false;
	};

	const get = async (key: string): Promise<T | undefined> => {
		const entry = cache.get(key);

		if (!entry) {
			stats.misses++;
			return undefined;
		}

		if (isExpired(entry)) {
			cache.delete(key);
			stats.size--;
			stats.misses++;
			return undefined;
		}

		stats.hits++;
		cache.set(key, {
			...entry,
			accessCount: entry.accessCount + 1,
			lastAccessedAt: new Date(),
		});

		return entry.value;
	};

	const set = async (key: string, value: T, ttl?: number): Promise<void> => {
		const now = new Date();
		const expiresAt = ttl ? new Date(now.getTime() + ttl) : undefined;

		const entry: CacheEntry<T> = {
			key,
			value,
			createdAt: now,
			expiresAt,
			accessCount: 0,
			lastAccessedAt: now,
		};

		cache.set(key, entry);
		stats.size++;

		if (options.maxSize && stats.size > options.maxSize) {
			evictLRU();
		}
	};

	const delete = async (key: string): Promise<void> => {
		if (cache.has(key)) {
			cache.delete(key);
			stats.size--;
		}
	};

	const clear = async (): Promise<void> => {
		cache.clear();
		stats.size = 0;
	};

	const has = async (key: string): Promise<boolean> => {
		const entry = cache.get(key);
		if (!entry) return false;
		if (isExpired(entry)) {
			cache.delete(key);
			stats.size--;
			return false;
		}
		return true;
	};

	const getStats = (): CacheStats => {
		return { ...stats };
	};

	const getEntry = async (key: string): Promise<CacheEntry<T> | undefined> => {
		return cache.get(key);
	};

	const evictLRU = (): void => {
		let lruKey: string | null = null;
		let lruTime = Date.now();

		for (const [key, entry] of cache.entries()) {
			if (entry.lastAccessedAt.getTime() < lruTime) {
				lruTime = entry.lastAccessedAt.getTime();
				lruKey = key;
			}
		}

		if (lruKey) {
			cache.delete(lruKey);
			stats.size--;
			stats.evictionCount++;
		}
	};

	const invalidate = async (pattern?: string): Promise<void> => {
		if (!pattern) {
			cache.clear();
			stats.size = 0;
			return;
		}

		const regex = new RegExp(pattern);
		for (const key of cache.keys()) {
			if (regex.test(key)) {
				cache.delete(key);
				stats.size--;
			}
		}
	};

	return Object.freeze({
		get,
		set,
		"delete": delete,
		clear,
		has,
		getStats,
		getEntry,
		invalidate,
	});
};
