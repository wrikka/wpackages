import type { CacheConfig, CacheEntry } from "./types";

export class Cache<T = unknown> {
	private cache: Map<string, CacheEntry<T>>;
	private config: Required<CacheConfig>;

	constructor(config: CacheConfig = {}) {
		this.cache = new Map();
		this.config = {
			maxSize: config.maxSize ?? 100,
			defaultTTL: config.defaultTTL ?? 5 * 60 * 1000, // 5 minutes
			storage: config.storage ?? "memory",
		};

		if (this.config.storage !== "memory") {
			this.loadFromStorage();
		}
	}

	set(key: string, data: T, ttl?: number): void {
		const now = Date.now();
		const expiresAt = now + (ttl ?? this.config.defaultTTL);

		const entry: CacheEntry<T> = {
			data,
			timestamp: now,
			expiresAt,
		};

		// Evict oldest if at capacity
		if (this.cache.size >= this.config.maxSize) {
			const oldestKey = this.getOldestKey();
			if (oldestKey) {
				this.delete(oldestKey);
			}
		}

		this.cache.set(key, entry);

		if (this.config.storage !== "memory") {
			this.saveToStorage();
		}
	}

	get<TData = T>(key: string): TData | undefined {
		const entry = this.cache.get(key) as CacheEntry<TData> | undefined;

		if (!entry) {
			return undefined;
		}

		// Check if expired
		if (Date.now() > entry.expiresAt) {
			this.delete(key);
			return undefined;
		}

		return entry.data;
	}

	has(key: string): boolean {
		const entry = this.cache.get(key);
		if (!entry) {
			return false;
		}

		if (Date.now() > entry.expiresAt) {
			this.delete(key);
			return false;
		}

		return true;
	}

	delete(key: string): boolean {
		const result = this.cache.delete(key);

		if (this.config.storage !== "memory") {
			this.saveToStorage();
		}

		return result;
	}

	clear(): void {
		this.cache.clear();

		if (this.config.storage !== "memory") {
			this.saveToStorage();
		}
	}

	size(): number {
		return this.cache.size;
	}

	keys(): string[] {
		return Array.from(this.cache.keys());
	}

	getOldestKey(): string | undefined {
		let oldestKey: string | undefined;
		let oldestTimestamp = Infinity;

		for (const [key, entry] of this.cache.entries()) {
			if (entry.timestamp < oldestTimestamp) {
				oldestTimestamp = entry.timestamp;
				oldestKey = key;
			}
		}

		return oldestKey;
	}

	private loadFromStorage(): void {
		try {
			const storage = this.config.storage === "localStorage" ? localStorage : sessionStorage;
			const data = storage.getItem("loader-cache");
			if (data) {
				const parsed = JSON.parse(data) as Record<string, CacheEntry<T>>;
				this.cache = new Map(Object.entries(parsed));
			}
		} catch {
			// Ignore storage errors
		}
	}

	private saveToStorage(): void {
		try {
			const storage = this.config.storage === "localStorage" ? localStorage : sessionStorage;
			const data = Object.fromEntries(this.cache.entries());
			storage.setItem("loader-cache", JSON.stringify(data));
		} catch {
			// Ignore storage errors
		}
	}
}
