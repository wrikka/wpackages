/**
 * Memoization utilities with functional programming principles
 */

import { createKey } from "../components/cache-utils";
import { createCache } from "../core/cache";
import type { Cache, CacheConfig } from "../types/cache.types";

// Memoization with cache
export const memoize = <T extends (...args: unknown[]) => unknown>(
	fn: T,
	config: CacheConfig = {},
): T => {
	const cache: Cache<string, ReturnType<T>> = createCache(config);

	return ((...args: Parameters<T>): ReturnType<T> => {
		const key = createKey(args);
		const cached = cache.get(key);

		if (cached !== undefined) {
			return cached;
		}

		const result = fn(...args) as ReturnType<T>;
		if (result !== null && result !== undefined) {
			cache.set(key, result);
		}
		return result;
	}) as unknown as T;
};

// Async memoization with cache
export const memoizeAsync = <T extends (...args: unknown[]) => Promise<unknown>>(
	fn: T,
	config: CacheConfig = {},
): T => {
	const cache: Cache<string, Promise<ReturnType<T>>> = createCache(config);

	return ((...args: Parameters<T>): Promise<ReturnType<T>> => {
		const key = JSON.stringify(args);
		const cached = cache.get(key);

		if (cached !== undefined) {
			return cached;
		}

		const result = fn(...args) as Promise<ReturnType<T>>;
		if (result !== null && result !== undefined) {
			cache.set(key, result);
		}
		return result;
	}) as unknown as T;
};

// Memoization with custom key function
export const memoizeWith = <T extends (...args: unknown[]) => unknown>(
	fn: T,
	keyFn: (...args: Parameters<T>) => string,
	config: CacheConfig = {},
): T => {
	const cache: Cache<string, ReturnType<T>> = createCache(config);

	return ((...args: Parameters<T>): ReturnType<T> => {
		const key = keyFn(...args);
		const cached = cache.get(key);

		if (cached !== undefined) {
			return cached;
		}

		const result = fn(...args) as ReturnType<T>;
		if (result !== null && result !== undefined) {
			cache.set(key, result);
		}
		return result;
	}) as unknown as T;
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
