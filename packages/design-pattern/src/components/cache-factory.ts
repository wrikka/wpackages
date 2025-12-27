/**
 * Cache Factory Component
 * Pure function for creating cached/memoized functions
 * Eliminates duplication across factory and decorator patterns
 */

/**
 * Create a cache key from arguments
 * @template T - Key type (must be serializable)
 * @param args - Arguments to cache
 * @returns Cache key
 */
const createCacheKey = <T extends readonly (string | number)[]>(args: T): string =>
	args.join("::");

/**
 * Create a memoized function with cache
 * @template TArgs - Arguments tuple type
 * @template TResult - Result type
 * @param fn - Function to memoize
 * @returns Memoized function with cache
 */
export const createMemoizedFn = <
	TArgs extends readonly (string | number)[],
	TResult,
>(
	fn: (...args: TArgs) => TResult,
): ((...args: TArgs) => TResult) & { readonly cache: Map<string, TResult> } => {
	const cache = new Map<string, TResult>();

	const memoized = (...args: TArgs): TResult => {
		const key = createCacheKey(args);
		if (cache.has(key)) {
			return cache.get(key) as TResult;
		}
		const result = fn(...args);
		cache.set(key, result);
		return result;
	};

	return Object.assign(memoized, { cache });
};

/**
 * Create a single-argument memoized function
 * @template T - Argument type (must be string or number)
 * @template R - Result type
 * @param fn - Function to memoize
 * @returns Memoized function
 */
export const createMemoizedSingleArg = <T extends string | number, R>(
	fn: (arg: T) => R,
): (arg: T) => R => {
	const cache = new Map<T, R>();
	return (arg: T): R => {
		if (cache.has(arg)) {
			return cache.get(arg) as R;
		}
		const result = fn(arg);
		cache.set(arg, result);
		return result;
	};
};

/**
 * Create a cached function with TTL (Time To Live)
 * @template TArgs - Arguments tuple type
 * @template TResult - Result type
 * @param fn - Function to cache
 * @param ttlMs - Time to live in milliseconds
 * @returns Cached function with TTL
 */
export const createCachedFnWithTTL = <
	TArgs extends readonly (string | number)[],
	TResult,
>(
	fn: (...args: TArgs) => TResult,
	ttlMs: number,
): (...args: TArgs) => TResult => {
	const cache = new Map<string, { readonly result: TResult; readonly expiresAt: number }>();

	return (...args: TArgs): TResult => {
		const key = createCacheKey(args);
		const now = Date.now();

		const cached = cache.get(key);
		if (cached && cached.expiresAt > now) {
			return cached.result;
		}

		const result = fn(...args);
		cache.set(key, { result, expiresAt: now + ttlMs });
		return result;
	};
};

/**
 * Create a cached function with max size
 * @template T - Key type
 * @template R - Result type
 * @param fn - Function to cache
 * @param maxSize - Maximum cache size
 * @returns Cached function with size limit
 */
export const createLimitedCache = <T extends string | number, R>(
	fn: (arg: T) => R,
	maxSize: number,
): (arg: T) => R => {
	const cache = new Map<T, R>();

	return (arg: T): R => {
		if (cache.has(arg)) {
			return cache.get(arg) as R;
		}

		if (cache.size >= maxSize) {
			const firstKey = cache.keys().next().value;
			if (firstKey !== undefined) {
				cache.delete(firstKey);
			}
		}

		const result = fn(arg);
		cache.set(arg, result);
		return result;
	};
};
