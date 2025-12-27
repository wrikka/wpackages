/**
 * Error Codes Constants
 * Standard error codes for different error types
 */

export const ERROR_CODES = {
	// Validation errors
	VALIDATION_ERROR: "VALIDATION_ERROR",
	INVALID_INPUT: "INVALID_INPUT",
	MISSING_FIELD: "MISSING_FIELD",

	// Not found errors
	NOT_FOUND: "NOT_FOUND",
	RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",

	// Authorization errors
	UNAUTHORIZED: "UNAUTHORIZED",
	FORBIDDEN: "FORBIDDEN",
	ACCESS_DENIED: "ACCESS_DENIED",

	// Conflict errors
	CONFLICT: "CONFLICT",
	DUPLICATE_RESOURCE: "DUPLICATE_RESOURCE",

	// Server errors
	INTERNAL_ERROR: "INTERNAL_ERROR",
	DATABASE_ERROR: "DATABASE_ERROR",
	NETWORK_ERROR: "NETWORK_ERROR",
	TIMEOUT_ERROR: "TIMEOUT_ERROR",

	// HTTP errors
	HTTP_ERROR: "HTTP_ERROR",
	BAD_REQUEST: "BAD_REQUEST",
	SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",

	// Application errors
	APP_ERROR: "APP_ERROR",
	UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
