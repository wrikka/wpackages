/**
 * Centralized Error Handler
 * Pure functions for consistent error handling across services
 */

import type { ConfigError } from "../types/config";

/**
 * Create a configuration error from caught exception
 */
export const createConfigError = (message: string, error: unknown): ConfigError => ({
	_tag: "ConfigError",
	message,
	cause: error,
});

/**
 * Format error message from caught exception
 */
export const formatErrorMessage = (error: unknown): string => {
	if (error instanceof Error) {
		return error.message;
	}
	return String(error);
};

/**
 * Create error message for file operations
 */
export const createFileErrorMessage = (operation: string, filePath: string, error: unknown): string => {
	return `Failed to ${operation} file: ${filePath} - ${formatErrorMessage(error)}`;
};

/**
 * Create error message for parsing operations
 */
export const createParseErrorMessage = (format: string, error: unknown): string => {
	return `Failed to parse ${format}: ${formatErrorMessage(error)}`;
};

/**
 * Create error message for serialization operations
 */
export const createSerializeErrorMessage = (format: string, error: unknown): string => {
	return `Failed to serialize to ${format}: ${formatErrorMessage(error)}`;
};

/**
 * Create error message for network operations
 */
export const createNetworkErrorMessage = (url: string, error: unknown): string => {
	return `Failed to fetch remote configuration from ${url}: ${formatErrorMessage(error)}`;
};
