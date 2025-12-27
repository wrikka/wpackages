/**
 * Error Composition - Pure functions for composing and manipulating errors
 */

import type * as E from "../types";

/**
 * Combine multiple errors into a single error metadata
 */
export function createCombinedErrorMetadata(
	errors: E.AnyError[],
): Record<string, unknown> {
	return {
		errors: errors.map((e, i) => ({
			index: i,
			name: e.name,
			message: e.message,
			code: e.code,
			metadata: e.metadata,
		})),
	};
}

/**
 * Create chained error metadata
 */
export function createChainedErrorMetadata(
	error: E.AnyError,
	additionalMetadata?: Record<string, unknown>,
): Record<string, unknown> {
	return {
		...additionalMetadata,
		chainedFrom: error,
	};
}

/**
 * Create error context metadata
 */
export function createContextMetadata(
	error: E.AnyError,
	context: Record<string, unknown>,
): Record<string, unknown> {
	return {
		...error.metadata,
		...context,
	};
}

/**
 * Filter errors by type predicate
 */
export function filterErrorsByType<T extends E.AnyError>(
	errors: E.AnyError[],
	predicate: (error: E.AnyError) => error is T,
): T[] {
	return errors.filter(predicate);
}

/**
 * Filter errors by name
 */
export function filterErrorsByName<T extends E.AnyError>(
	errors: E.AnyError[],
	errorName: T["name"],
): T[] {
	return errors.filter((e): e is T => e.name === errorName);
}

/**
 * Transform error with mapper function
 */
export function transformError(
	error: E.AnyError,
	mapper: (error: E.AnyError) => E.AnyError,
): E.AnyError {
	return mapper(error);
}

/**
 * Transform multiple errors
 */
export function transformErrors(
	errors: E.AnyError[],
	mapper: (error: E.AnyError) => E.AnyError,
): E.AnyError[] {
	return errors.map(mapper);
}
