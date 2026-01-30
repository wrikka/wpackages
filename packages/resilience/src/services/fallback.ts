/**
 * Fallback service implementation
 */

import { Effect } from "effect";
import type { CacheConfig, FallbackChainConfig, FallbackConfig, FallbackResult } from "../types";

// Fallback wrapper
export const withFallback = async <T>(
	fn: () => Promise<T>,
	config: FallbackConfig<T>,
): Promise<T> => {
	try {
		const value = await fn();
		config.onSuccess?.(value);
		return value;
	} catch (err) {
		const error = err as Error;

		const shouldFallback = config.shouldFallback
			? config.shouldFallback(error)
			: true;

		if (!shouldFallback) {
			throw error;
		}

		if (config.fallbackFn) {
			const fallbackValue = await Promise.resolve(config.fallbackFn());
			config.onFallback?.(error, fallbackValue);
			return fallbackValue;
		}

		if (config.fallbackValue !== undefined) {
			config.onFallback?.(error, config.fallbackValue);
			return config.fallbackValue;
		}

		throw error;
	}
};

// Fallback with result tracking
export const fallback = async <T>(
	fn: () => Promise<T>,
	config: FallbackConfig<T>,
): Promise<FallbackResult<T>> => {
	try {
		const value = await fn();
		config.onSuccess?.(value);
		return {
			fallbackUsed: false,
			success: true,
			value,
		};
	} catch (err) {
		const error = err as Error;

		const shouldFallback = config.shouldFallback
			? config.shouldFallback(error)
			: true;

		if (!shouldFallback) {
			return {
				error: error,
				success: false,
			};
		}

		if (config.fallbackFn) {
			try {
				const fallbackValue = await Promise.resolve(config.fallbackFn());
				config.onFallback?.(error, fallbackValue);
				return {
					error: error,
					fallbackUsed: true,
					success: true,
					value: fallbackValue,
				};
			} catch (fallbackError) {
				return {
					error: fallbackError as Error,
					success: false,
				};
			}
		}

		if (config.fallbackValue !== undefined) {
			config.onFallback?.(error, config.fallbackValue);
			return {
				error: error,
				fallbackUsed: true,
				success: true,
				value: config.fallbackValue,
			};
		}

		return {
			error: error,
			success: false,
		};
	}
};

// Fallback chain
export const fallbackChain = async <T>(
	config: FallbackChainConfig<T>,
): Promise<T> => {
	const { operations, shouldContinue, onOperationFailed } = config;
	let lastError: Error | undefined;

	for (let i = 0; i < operations.length; i++) {
		const operation = operations[i];
		if (!operation) continue;

		try {
			const result = await operation();
			return result;
		} catch (err) {
			lastError = err as Error;
			onOperationFailed?.(i, lastError);

			const shouldStop = shouldContinue && !shouldContinue(lastError);
			if (shouldStop) {
				throw lastError;
			}
		}
	}

	throw lastError || new Error("All fallback operations failed");
};

// Cache wrapper
export const withCache = <T>(
	fn: () => Promise<T>,
	config: CacheConfig<T>,
): () => Promise<T> => {
	const cache = new Map<string, { value: T; timestamp: number }>();
	const key = config.key || "default";
	const ttl = config.ttl || 60000;

	return async () => {
		const cached = cache.get(key);

		if (cached) {
			const age = Date.now() - cached.timestamp;
			if (age < ttl) {
				config.onCacheHit?.(cached.value);
				return cached.value;
			}
		}

		config.onCacheMiss?.();

		const value = await fn();
		cache.set(key, { timestamp: Date.now(), value });

		return value;
	};
};

// Memoization
export const memoize = <T extends unknown[], R>(
	fn: (...args: T) => Promise<R>,
	options: { ttl?: number; keyFn?: (...args: T) => string } = {},
): (...args: T) => Promise<R> => {
	const cache = new Map<string, { value: R; timestamp: number }>();
	const ttl = options.ttl || 60000;
	const keyFn = options.keyFn || ((...args: T) => JSON.stringify(args));

	return async (...args: T): Promise<R> => {
		const key = keyFn(...args);
		const cached = cache.get(key);

		if (cached) {
			const age = Date.now() - cached.timestamp;
			if (age < ttl) {
				return cached.value;
			}
		}

		const value = await fn(...args);
		cache.set(key, { timestamp: Date.now(), value });

		return value;
	};
};

// Effect-based fallback
export const fallbackEffect = <T>(
	effect: Effect.Effect<T, Error>,
	config: FallbackConfig<T>,
): Effect.Effect<T, Error> =>
	Effect.catchAll(effect, (error) => {
		const shouldFallback = config.shouldFallback
			? config.shouldFallback(error)
			: true;

		if (!shouldFallback) {
			return Effect.fail(error);
		}

		if (config.fallbackFn) {
			return Effect.tryPromise({
				try: () => Promise.resolve(config.fallbackFn!()),
				catch: (fallbackError) => new Error(`Fallback failed: ${fallbackError}`),
			});
		}

		if (config.fallbackValue !== undefined) {
			return Effect.succeed(config.fallbackValue as T);
		}

		return Effect.fail(error);
	});

// Fallback config factory
export const createFallbackConfig = <T>(
	partial: Partial<FallbackConfig<T>>,
): FallbackConfig<T> => ({
	...(partial.fallbackValue !== undefined && {
		fallbackValue: partial.fallbackValue,
	}),
	...(partial.fallbackFn && { fallbackFn: partial.fallbackFn }),
	...(partial.shouldFallback && { shouldFallback: partial.shouldFallback }),
	...(partial.onFallback && { onFallback: partial.onFallback }),
	...(partial.onSuccess && { onSuccess: partial.onSuccess }),
});

// Default fallback configuration
export const defaultFallbackConfig: FallbackConfig<unknown> = {};
