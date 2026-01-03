/**
 * Unified error handling utilities
 */

/**
 * Format error message
 */
export const formatErrorMessage = (error: unknown): string => {
	if (error instanceof Error) {
		return error.message;
	}
	if (typeof error === "string") {
		return error;
	}
	return "Unknown error";
};

/**
 * Create error with context
 */
export const createError = (message: string, context?: Record<string, unknown>): Error => {
	const error = new Error(message);
	if (context) {
		Object.assign(error, context);
	}
	return error;
};

/**
 * Check if error is specific type
 */
export const isErrorType = (error: unknown, type: string): boolean => {
	if (error instanceof Error) {
		return error.name === type || error.message.includes(type);
	}
	return false;
};

/**
 * Wrap async function with error handling
 */
export const withErrorHandling = async <T>(
	fn: () => Promise<T>,
	errorMessage: string,
): Promise<T> => {
	try {
		return await fn();
	} catch (error) {
		throw createError(
			`${errorMessage}: ${formatErrorMessage(error)}`,
			{ originalError: error },
		);
	}
};

/**
 * Wrap sync function with error handling
 */
export const withErrorHandlingSync = <T>(
	fn: () => T,
	errorMessage: string,
): T => {
	try {
		return fn();
	} catch (error) {
		throw createError(
			`${errorMessage}: ${formatErrorMessage(error)}`,
			{ originalError: error },
		);
	}
};

/**
 * Handle error with fallback
 */
export const handleErrorWithFallback = async <T>(
	fn: () => Promise<T>,
	fallback: T,
	errorHandler?: (error: unknown) => void,
): Promise<T> => {
	try {
		return await fn();
	} catch (error) {
		if (errorHandler) {
			errorHandler(error);
		}
		return fallback;
	}
};
