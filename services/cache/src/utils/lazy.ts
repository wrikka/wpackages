/**
 * Lazy evaluation utilities with caching
 */

import { createCache } from "../core/cache";
import type { Cache, CacheConfig } from "../types/cache.types";

// Lazy value with caching
export class Lazy<T> {
	private _value: T | undefined = undefined;
	private computed = false;
	private readonly cache: Cache<string, T>;

	constructor(
		private readonly computation: () => T,
		config?: CacheConfig,
	) {
		this.cache = createCache<string, T>(config);
	}

	get(): T {
		const key = "lazy-value";
		const cached = this.cache.get(key);
		if (cached !== undefined) {
			return cached;
		}

		if (!this.computed) {
			this.computed = true;
			this._value = this.computation();
			if (this._value !== undefined) {
				this.cache.set(key, this._value);
			}
		}

		if (this._value !== undefined) {
			return this._value;
		}

		throw new Error("Lazy value has not been computed yet.");
	}

	isComputed(): boolean {
		return this.cache.has("lazy-value");
	}
}

// Async lazy value with caching
export class AsyncLazy<T> {
	private promise: Promise<T> | null = null;
	private readonly cache: Cache<string, Promise<T>>;

	constructor(
		private readonly computation: () => Promise<T>,
		config?: CacheConfig,
	) {
		this.cache = createCache<string, Promise<T>>(config);
	}

	get(): Promise<T> {
		const key = "async-lazy-value";
		const cached = this.cache.get(key);
		if (cached !== undefined) {
			return cached;
		}

		if (!this.promise) {
			this.promise = this.computation();
			this.cache.set(key, this.promise);
		}

		return this.promise;
	}

	isResolved(): boolean {
		return this.cache.has("async-lazy-value");
	}
}

// Factory functions
export const lazy = <T>(computation: () => T, config?: CacheConfig): Lazy<T> => {
	return new Lazy(computation, config);
};

export const asyncLazy = <T>(computation: () => Promise<T>, config?: CacheConfig): AsyncLazy<T> => {
	return new AsyncLazy(computation, config);
};
