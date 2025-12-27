/**
 * Pure functions for error formatting
 */

/**
 * Format error message from unknown error type
 */
export const formatErrorMessage = (error: unknown): string => {
	if (error instanceof Error) {
		return error.message;
	}
	return "Unknown error";
};

/**
 * Create error message with context
 */
export const createErrorMessage = (context: string, error: unknown): string => {
	return `${context}: ${formatErrorMessage(error)}`;
};
