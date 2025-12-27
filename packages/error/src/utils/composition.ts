/**
 * Error Composition - Utilities for composing and manipulating errors
 */

import * as E from "../types";
import { appError } from "../services";
import { createCombinedErrorMetadata, createChainedErrorMetadata, createContextMetadata, filterErrorsByName } from "../components";

/**
 * Combine multiple errors into a single error
 */
export function combineErrors(
	errors: E.AnyError[],
	message?: string,
): E.AppError {
	const defaultMessage = `Multiple errors occurred (${errors.length} errors)`;
	const combinedMessage = message ?? defaultMessage;

	const metadata = createCombinedErrorMetadata(errors);

	return appError(combinedMessage, { metadata });
}

/**
 * Add context to an error
 */
export function addContext<T extends E.AnyError>(
	error: T,
	context: Record<string, unknown>,
): T {
	const newMetadata = createContextMetadata(error, context);
	return {
		...error,
		metadata: newMetadata,
	} as T;
}

/**
 * Chain errors - create a new error that wraps another error
 */
export function chainError<T extends E.AnyError>(
	error: T,
	message: string,
	options?: {
		code?: string;
		metadata?: Record<string, unknown>;
	},
): E.AppError {
	const chainedMetadata = createChainedErrorMetadata(error, options?.metadata);
	const config: Record<string, unknown> = {
		metadata: chainedMetadata,
		cause: error,
	};

	if (options?.code) {
		config["code"] = options.code;
	}

	return appError(message, config);
}

/**
 * Filter errors by type
 */
export function filterErrors<T extends E.AnyError>(
	errors: E.AnyError[],
	errorType: T['name'],
): T[] {
	return filterErrorsByName(errors, errorType);
}

/**
 * Map over errors to transform them
 */
export function mapErrors(
	errors: E.AnyError[],
	mapper: (error: E.AnyError) => E.AnyError,
): E.AnyError[] {
	return errors.map(mapper);
}

/**
 * Error group - represents a group of related errors
 */

/**
 * Create an error group
 */
export function errorGroup(
	errors: E.AnyError[],
	message?: string,
	options?: {
		code?: string;
		metadata?: Record<string, unknown>;
	},
): E.ErrorGroup {
	const defaultMessage = `Error group with ${errors.length} errors`;
	const combinedMessage = message ?? defaultMessage;

	return E.ErrorGroup.make({ name: 'ErrorGroup', message: combinedMessage, errors, ...options });
}
