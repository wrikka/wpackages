/**
 * Fallback types
 */

export type FallbackConfig<T> = {
	readonly fallbackValue?: T;
	readonly fallbackFn?: () => T | Promise<T>;
	readonly shouldFallback?: (error: Error) => boolean;
	readonly onFallback?: (error: Error, fallbackValue: T) => void;
	readonly onSuccess?: (value: T) => void;
};

export type FallbackResult<T> =
	| { readonly success: true; readonly value: T; readonly fallbackUsed: false }
	| {
		readonly success: true;
		readonly value: T;
		readonly fallbackUsed: true;
		readonly error: Error;
	}
	| { readonly success: false; readonly error: Error };

export type FallbackChainConfig<T> = {
	readonly operations: ReadonlyArray<() => Promise<T>>;
	readonly shouldContinue?: (error: Error) => boolean;
	readonly onOperationFailed?: (index: number, error: Error) => void;
};

export type CacheConfig<T> = {
	readonly ttl?: number;
	readonly key?: string;
	readonly onCacheHit?: (value: T) => void;
	readonly onCacheMiss?: () => void;
};
