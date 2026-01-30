/**
 * Utility functions for creating and manipulating ResilienceResult objects.
 */

import type { ResilienceResult } from "../types";

/**
 * Create a successful resilience result
 */
export const createSuccess = <T>(data: T): ResilienceResult<T> => ({
	success: true,
	data,
	metadata: {
		attempts: 1,
		duration: 0,
	},
});

/**
 * Create a failed resilience result
 */
export const createFailure = <T>(error: Error, attempts = 1, duration = 0): ResilienceResult<T> => ({
	success: false,
	error,
	metadata: {
		attempts,
		duration,
	},
});

/**
 * Map success data through a function
 */
export const map = <A, B>(fn: (a: A) => B) => (result: ResilienceResult<A>): ResilienceResult<B> => {
	if (isSuccess(result)) {
		return {
			...result,
			data: fn(result.data),
		};
	}
	return result as unknown as ResilienceResult<B>;
};

/**
 * Chain operations on resilience results
 */
export const chain = <A, B>(
	fn: (a: A) => Promise<ResilienceResult<B>>,
) =>
async (result: ResilienceResult<A>): Promise<ResilienceResult<B>> => {
	if (isSuccess(result)) {
		return fn(result.data);
	}
	return result as unknown as ResilienceResult<B>;
};

/**
 * Check if result is successful
 */
export const isSuccess = <T>(result: ResilienceResult<T>): result is ResilienceResult<T> & { success: true; data: T } =>
	result.success && result.data !== undefined;

/**
 * Check if result is failed
 */
export const isFailure = <T>(
	result: ResilienceResult<T>,
): result is ResilienceResult<T> & { success: false; error: Error } => !result.success;

/**
 * Get result data or throw error
 */
export const getOrElse = <T>(result: ResilienceResult<T>, defaultValue: T): T =>
	isSuccess(result) ? result.data : defaultValue;

/**
 * Get result data or throw error
 */
export const getOrThrow = <T>(result: ResilienceResult<T>): T => {
	if (isSuccess(result)) {
		return result.data;
	}
	throw result.error || new Error("Unknown error");
};
