import type { AsyncResult, FallbackOptions, RetryOptions } from "./types";

/**
 * Safely execute an async function and return a result object
 *
 * @param fn - Async function to execute
 * @returns Promise with success/failure result
 */
export const safeAsync = async <T, E = Error>(fn: () => Promise<T>): AsyncResult<T, E> => {
	try {
		const value = await fn();
		return { success: true, value };
	} catch (_error) {
		const error = _error instanceof Error ? _error : new Error(String(_error));
		return { success: false, error: error as E };
	}
};

/**
 * Retry an async function with exponential backoff
 *
 * @param fn - Async function to retry
 * @param options - Retry options
 * @returns Promise with result or final error
 */
export const retryAsync = async <T>(
	fn: () => Promise<T>,
	_options: RetryOptions = {},
): Promise<T> => {
	const {
		maxAttempts = 3,
		delay = 1000,
		backoff = "exponential",
		jitter = false,
	} = _options;

	let lastError: unknown;
	let currentDelay = delay;

	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		try {
			return await fn();
		} catch (_error) {
			lastError = _error;

			// Don't delay on the last attempt
			if (attempt < maxAttempts - 1) {
				// Apply jitter if requested
				let actualDelay = currentDelay;
				if (jitter) {
					actualDelay = currentDelay * (0.5 + Math.random() * 0.5);
				}

				await new Promise(resolve => setTimeout(resolve, actualDelay));

				// Apply backoff strategy
				if (backoff === "exponential") {
					currentDelay *= 2;
				} else if (backoff === "linear") {
					currentDelay += delay;
				}
			}
		}
	}

	throw lastError;
};

/**
 * Execute an async function with a fallback value
 *
 * @param fn - Async function to execute
 * @param fallback - Fallback value to return on error
 * @param options - Fallback options
 * @returns Promise with result or fallback value
 */
export const withFallback = async <T>(
	fn: () => Promise<T>,
	fallback: T,
	_options: FallbackOptions<T> = {},
): Promise<T> => {
	const { onError, logErrors = false } = _options;

	try {
		return await fn();
	} catch (_error) {
		const error = _error instanceof Error ? _error : new Error(String(_error));
		if (logErrors) {
			console.error("Async operation failed:", error);
		}

		if (onError) {
			onError(error);
		}

		return fallback;
	}
};

/**
 * Execute multiple async functions with individual error handling
 *
 * @param fns - Array of async functions
 * @returns Array of results with success/failure information
 */
export const allSettledSafe = async <T>(
	fns: Array<() => Promise<T>>,
): Promise<Array<{ success: true; value: T } | { success: false; error: unknown }>> => {
	const promises = fns.map(fn => safeAsync(fn));
	const results = await Promise.all(promises);
	return results as Array<{ success: true; value: T } | { success: false; error: unknown }>;
};

/**
 * Execute async functions with timeout
 *
 * @param fn - Async function to execute
 * @param ms - Timeout in milliseconds
 * @returns Promise with result or timeout error
 */
export const withTimeout = async <T>(fn: () => Promise<T>, ms: number): Promise<T> => {
	return Promise.race([
		fn(),
		new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)),
	]);
};
