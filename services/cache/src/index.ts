/**
 * caching - Functional Caching Library
 *
 * A comprehensive caching library built with functional programming principles.
 * Features include memoization, TTL, LRU eviction, and lazy evaluation.
 *
 * @example
 * ```ts
 * import { createCache, memoize } from 'caching';
 *
 * // Create a cache with TTL and LRU eviction
 * const cache = createCache<string, number>({
 *   maxSize: 100,
 *   ttl: 5000,
 *   lru: true
 * });
 *
 * // Memoize expensive functions
 * const expensiveFn = memoize((x: number) => {
 *   // Expensive computation
 *   return x * x;
 * });
 * ```
 */

// Core types
export type { Cache, CacheConfig, CacheEntry, CacheStats } from "./types/index";

// Core functionality
export { createCache } from "./core/index";

// Services
export { CacheService } from "./services/index";

// Utilities
export {
	AsyncLazy,
	asyncLazy,
	createAutoKeyCache,
	createRetryCache,
	createTTLCache,
	Lazy,
	lazy,
	memoize,
	memoizeAsync,
	memoizeWeak,
	memoizeWith,
} from "./utils/index";

// Lib wrappers
export { createLocalStorageCache, createSessionStorageCache } from "./lib/index";
