/**
 * Registry Factory Component
 * Pure functions for creating registry/map-based storage patterns
 * Eliminates duplication across singleton and other patterns
 */

/**
 * Create a simple registry for storing instances
 * @template T - Instance type
 * @returns Registry with get, set, has, delete, clear, keys methods
 */
export const createRegistry = <T>() => {
	const storage = new Map<string, T>();

	return {
		get: (key: string): T | undefined => storage.get(key),
		set: (key: string, value: T): void => {
			storage.set(key, value);
		},
		has: (key: string): boolean => storage.has(key),
		delete: (key: string): boolean => storage.delete(key),
		clear: (): void => {
			storage.clear();
		},
		keys: (): readonly string[] => Array.from(storage.keys()),
		values: (): readonly T[] => Array.from(storage.values()),
		size: (): number => storage.size,
	};
};

/**
 * Create a registry with factory function for lazy initialization
 * @template T - Instance type
 * @param factory - Factory function to create instances
 * @returns Registry with lazy initialization
 */
export const createLazyRegistry = <T>(factory: (key: string) => T) => {
	const storage = new Map<string, T>();

	return {
		get: (key: string): T => {
			if (!storage.has(key)) {
				storage.set(key, factory(key));
			}
			return storage.get(key) as T;
		},
		has: (key: string): boolean => storage.has(key),
		delete: (key: string): boolean => storage.delete(key),
		clear: (): void => {
			storage.clear();
		},
		keys: (): readonly string[] => Array.from(storage.keys()),
		values: (): readonly T[] => Array.from(storage.values()),
		size: (): number => storage.size,
	};
};

/**
 * Create a registry with validation
 * @template T - Instance type
 * @param validator - Validation function
 * @returns Registry with validation
 */
export const createValidatedRegistry = <T>(validator: (value: T) => boolean) => {
	const storage = new Map<string, T>();

	return {
		set: (key: string, value: T): void => {
			if (!validator(value)) {
				throw new Error(`Validation failed for key: ${key}`);
			}
			storage.set(key, value);
		},
		get: (key: string): T | undefined => storage.get(key),
		has: (key: string): boolean => storage.has(key),
		delete: (key: string): boolean => storage.delete(key),
		clear: (): void => {
			storage.clear();
		},
		keys: (): readonly string[] => Array.from(storage.keys()),
		values: (): readonly T[] => Array.from(storage.values()),
		size: (): number => storage.size,
	};
};

/**
 * Create a registry with expiration
 * @template T - Instance type
 * @param ttlMs - Time to live in milliseconds
 * @returns Registry with expiration
 */
export const createExpiringRegistry = <T>(ttlMs: number) => {
	const storage = new Map<string, { readonly value: T; readonly expiresAt: number }>();

	const cleanup = (): void => {
		const now = Date.now();
		for (const [key, entry] of storage.entries()) {
			if (entry.expiresAt <= now) {
				storage.delete(key);
			}
		}
	};

	return {
		set: (key: string, value: T): void => {
			storage.set(key, { value, expiresAt: Date.now() + ttlMs });
		},
		get: (key: string): T | undefined => {
			cleanup();
			const entry = storage.get(key);
			if (!entry) return undefined;
			if (entry.expiresAt <= Date.now()) {
				storage.delete(key);
				return undefined;
			}
			return entry.value;
		},
		has: (key: string): boolean => {
			cleanup();
			const entry = storage.get(key);
			return entry !== undefined && entry.expiresAt > Date.now();
		},
		delete: (key: string): boolean => storage.delete(key),
		clear: (): void => {
			storage.clear();
		},
		keys: (): readonly string[] => {
			cleanup();
			return Array.from(storage.keys());
		},
		values: (): readonly T[] => {
			cleanup();
			return Array.from(storage.values()).map((entry) => entry.value);
		},
		size: (): number => {
			cleanup();
			return storage.size;
		},
	};
};

/**
 * Create a registry with size limit (LRU-like)
 * @template T - Instance type
 * @param maxSize - Maximum number of entries
 * @returns Registry with size limit
 */
export const createLimitedRegistry = <T>(maxSize: number) => {
	const storage = new Map<string, T>();

	return {
		set: (key: string, value: T): void => {
			if (storage.size >= maxSize && !storage.has(key)) {
				const firstKey = storage.keys().next().value;
				if (firstKey) {
					storage.delete(firstKey);
				}
			}
			storage.set(key, value);
		},
		get: (key: string): T | undefined => storage.get(key),
		has: (key: string): boolean => storage.has(key),
		delete: (key: string): boolean => storage.delete(key),
		clear: (): void => {
			storage.clear();
		},
		keys: (): readonly string[] => Array.from(storage.keys()),
		values: (): readonly T[] => Array.from(storage.values()),
		size: (): number => storage.size,
	};
};
