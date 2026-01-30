/**
 * HTTP constants
 */

/**
 * Common HTTP status codes
 */
export const HTTP_STATUS = {
	ACCEPTED: 202,
	BAD_GATEWAY: 502,
	BAD_REQUEST: 400,
	CONFLICT: 409,
	CREATED: 201,
	FORBIDDEN: 403,
	GATEWAY_TIMEOUT: 504,
	INTERNAL_SERVER_ERROR: 500,
	METHOD_NOT_ALLOWED: 405,
	NO_CONTENT: 204,
	NOT_FOUND: 404,
	OK: 200,
	SERVICE_UNAVAILABLE: 503,
	TOO_MANY_REQUESTS: 429,
	UNAUTHORIZED: 401,
	UNPROCESSABLE_ENTITY: 422,
} as const;

/**
 * Common HTTP headers
 */
export const HTTP_HEADERS = {
	ACCEPT: "Accept",
	API_KEY: "X-API-Key",
	AUTHORIZATION: "Authorization",
	CONTENT_TYPE: "Content-Type",
	RATE_LIMIT: "X-RateLimit-Limit",
	RATE_LIMIT_REMAINING: "X-RateLimit-Remaining",
	RATE_LIMIT_RESET: "X-RateLimit-Reset",
	REQUEST_ID: "X-Request-ID",
	RETRY_AFTER: "Retry-After",
	USER_AGENT: "User-Agent",
} as const;

/**
 * Common content types
 */
export const CONTENT_TYPES = {
	FORM: "application/x-www-form-urlencoded",
	HTML: "text/html",
	JSON: "application/json",
	MULTIPART: "multipart/form-data",
	TEXT: "text/plain",
	XML: "application/xml",
} as const;

/**
 * Retryable HTTP status codes
 */
export const RETRYABLE_STATUS_CODES = [
	HTTP_STATUS.TOO_MANY_REQUESTS,
	HTTP_STATUS.INTERNAL_SERVER_ERROR,
	HTTP_STATUS.BAD_GATEWAY,
	HTTP_STATUS.SERVICE_UNAVAILABLE,
	HTTP_STATUS.GATEWAY_TIMEOUT,
] as const;
