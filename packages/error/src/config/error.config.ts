/**
 * Error Configuration
 * Centralized error handling settings
 */

export const ERROR_CONFIG = {
	// Error behavior
	throwOnError: false,
	collectErrors: true,
	maxErrors: 100,

	// Error formatting
	includeStackTrace: process.env.NODE_ENV !== "production",
	includeContext: true,
	includeTimestamp: true,

	// Error logging
	logErrors: true,
	logLevel: "error" as const,

	// Error recovery
	enableRecovery: true,
	retryAttempts: 3,
	retryDelay: 1000,
} as const;

export type ErrorConfig = typeof ERROR_CONFIG;
