/**
 * Error Formatter Component
 * Pure functions for formatting error messages
 */

/**
 * Format error message from Error object or string
 * @param error - Error object or string
 * @returns Formatted error message
 */
export const formatErrorMessage = (error: unknown): string => {
	if (error instanceof Error) {
		return error.message;
	}
	return String(error);
};

/**
 * Format error with context
 * @param context - Context description
 * @param error - Error object or string
 * @returns Formatted error message with context
 */
export const formatErrorWithContext = (context: string, error: unknown): string => {
	return `${context}: ${formatErrorMessage(error)}`;
};

/**
 * Format file operation error
 * @param operation - Operation name (e.g., "save", "load")
 * @param filePath - File path
 * @param error - Error object or string
 * @returns Formatted error message
 */
export const formatFileOperationError = (
	operation: string,
	filePath: string,
	error: unknown,
): string => {
	return `Failed to ${operation} plugin registry at ${filePath}: ${formatErrorMessage(error)}`;
};

/**
 * Format plugin error
 * @param pluginId - Plugin ID
 * @param error - Error object or string
 * @returns Formatted error message
 */
export const formatPluginError = (pluginId: string, error: unknown): string => {
	return `Plugin ${pluginId} error: ${formatErrorMessage(error)}`;
};

/**
 * Format validation error
 * @param field - Field name
 * @param error - Error object or string
 * @returns Formatted error message
 */
export const formatValidationError = (field: string, error: unknown): string => {
	return `Validation failed for ${field}: ${formatErrorMessage(error)}`;
};
