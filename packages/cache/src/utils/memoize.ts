/**
 * Memoization utilities with functional programming principles
 */

import { patterns } from "@wpackages/design-pattern";

// Re-exporting createMemoizedFn for local project use
export const memoize = patterns.creational.cacheFactory.createMemoizedFn;

// Async memoization with cache - createMemoizedFn handles promises correctly.
export const memoizeAsync = patterns.creational.cacheFactory.createMemoizedFn;

// Memoization with custom key function
export const memoizeWith = <T extends (...args: any[]) => unknown>(
	fn: T,
	keyFn: (...args: Parameters<T>) => string,
): T => {
	// The `as T` is a safe cast because the enhanced createMemoizedFn returns a function with the same signature.
	return patterns.creational.cacheFactory.createMemoizedFn(fn, { keyFn }) as unknown as T;
};

// Local implementation for createKey for memoizeWeak
const createKey = (...args: any[]): string => {
	try {
		return JSON.stringify(args);
	} catch {
		// Fallback for non-serializable arguments
		return args.map(arg => String(arg)).join("|");
	}
};

// WeakMap-based memoization for object arguments
export const memoizeWeak = <T extends (arg: object, ...args: unknown[]) => unknown>(
	fn: T,
): T => {
	const cache = new WeakMap<object, Map<string, ReturnType<T>>>();

	return ((obj: object, ...args: unknown[]): ReturnType<T> => {
		if (!cache.has(obj)) {
			cache.set(obj, new Map());
		}

		const objCache = cache.get(obj);
		if (!objCache) {
			throw new Error("Cache not found for object");
		}
		const key = createKey(args);
		const cached = objCache.get(key);

		if (cached !== undefined) {
			return cached;
		}

		const result = fn(obj, ...args) as ReturnType<T>;
		objCache.set(key, result);
		return result;
	}) as unknown as T;
};
