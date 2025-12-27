import type { IntegrationError } from "../types";

/**
 * Generic error factory - Pure function for creating integration errors
 * Reduces duplication and provides consistent error creation
 */
const createError = <T extends IntegrationError["type"]>(
	type: T,
	message: string,
	extras?: Record<string, unknown>,
): IntegrationError => ({
	type,
	message,
	...extras,
} as IntegrationError);

/**
 * Create authentication error
 */
export const createAuthenticationError = (
	message: string,
	code?: string,
	details?: Record<string, unknown>,
): IntegrationError =>
	createError("authentication", message, {
		...(code !== undefined && { code }),
		...(details !== undefined && { details }),
	});

/**
 * Create rate limit error
 */
export const createRateLimitError = (
	message: string,
	options?: {
		retryAfter?: number;
		limit?: number;
		remaining?: number;
		resetAt?: number;
	},
): IntegrationError =>
	createError("rate_limit", message, options);

/**
 * Create network error
 */
export const createNetworkError = (
	message: string,
	statusCode?: number,
	cause?: unknown,
): IntegrationError =>
	createError("network", message, {
		...(statusCode !== undefined && { statusCode }),
		...(cause !== undefined && { cause }),
	});

/**
 * Create validation error
 */
export const createValidationError = (
	message: string,
	field?: string,
	errors?: readonly string[],
): IntegrationError =>
	createError("validation", message, {
		...(field !== undefined && { field }),
		...(errors !== undefined && { errors }),
	});

/**
 * Create timeout error
 */
export const createTimeoutError = (
	message: string,
	timeout?: number,
	operation?: string,
): IntegrationError =>
	createError("timeout", message, {
		...(timeout !== undefined && { timeout }),
		...(operation !== undefined && { operation }),
	});

/**
 * Create configuration error
 */
export const createConfigurationError = (
	message: string,
	field?: string,
): IntegrationError =>
	createError("configuration", message, {
		...(field !== undefined && { field }),
	});

/**
 * Create unknown error
 */
export const createUnknownError = (message: string): IntegrationError =>
	createError("unknown", message);

/**
 * Convert any error to IntegrationError
 */
export const toIntegrationError = (error: unknown): IntegrationError => {
	if (error instanceof Error) {
		return createUnknownError(error.message);
	}
	return createUnknownError(String(error));
};

/**
 * Type guard for IntegrationError
 */
export const isIntegrationError = (value: unknown): value is IntegrationError => {
	if (typeof value !== "object" || value === null) {
		return false;
	}
	const obj = value as Record<string, unknown>;
	return (
		typeof obj["type"] === "string" &&
		typeof obj["message"] === "string" &&
		[
			"authentication",
			"rate_limit",
			"network",
			"validation",
			"timeout",
			"configuration",
			"unknown",
		].includes(obj["type"] as string)
	);
};
