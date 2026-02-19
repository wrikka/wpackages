import { CONTENT_TYPES, DEFAULT_USER_AGENT, HTTP_HEADERS } from "../constant";
import type { AuthConfig } from "../types";

/**
 * Header utilities - Pure functions
 */

/**
 * Build authorization header from auth config
 */
export const buildAuthHeader = (auth: AuthConfig): Record<string, string> => {
	switch (auth.type) {
		case "api_key":
			return auth.location === "header" ? { [auth.name]: auth.key } : {};

		case "bearer":
			return { [HTTP_HEADERS.AUTHORIZATION]: `Bearer ${auth.token}` };

		case "basic": {
			const credentials = btoa(`${auth.username}:${auth.password}`);
			return { [HTTP_HEADERS.AUTHORIZATION]: `Basic ${credentials}` };
		}

		case "oauth2":
			return auth.accessToken
				? {
					[HTTP_HEADERS.AUTHORIZATION]: `${auth.tokenType || "Bearer"} ${auth.accessToken}`,
				}
				: {};

		case "custom":
			return auth.headers || {};

		default:
			return {};
	}
};

/**
 * Merge headers (later values override earlier ones)
 */
export const mergeHeaders = (
	...headers: Array<Record<string, string> | undefined>
): Record<string, string> => {
	return headers
		.filter((h): h is Record<string, string> => h !== undefined)
		.reduce(
			(acc, current) => ({ ...acc, ...current }),
			{} as Record<string, string>,
		);
};

/**
 * Build default headers
 */
export const buildDefaultHeaders = (): Record<string, string> => ({
	[HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.JSON,
	[HTTP_HEADERS.ACCEPT]: CONTENT_TYPES.JSON,
	[HTTP_HEADERS.USER_AGENT]: DEFAULT_USER_AGENT,
});

/**
 * Normalize header names to lowercase
 */
export const normalizeHeaders = (
	headers: Record<string, string>,
): Record<string, string> => {
	return Object.entries(headers).reduce(
		(acc, [key, value]) => {
			acc[key.toLowerCase()] = value;
			return acc;
		},
		{} as Record<string, string>,
	);
};

/**
 * Extract rate limit info from headers
 */
export const extractRateLimitInfo = (
	headers: Record<string, string>,
): {
	limit?: number;
	remaining?: number;
	resetAt?: number;
	retryAfter?: number;
} => {
	const normalized = normalizeHeaders(headers);
	const result: {
		limit?: number;
		remaining?: number;
		resetAt?: number;
		retryAfter?: number;
	} = {};

	if (normalized["x-ratelimit-limit"]) {
		result.limit = Number.parseInt(normalized["x-ratelimit-limit"], 10);
	}
	if (normalized["x-ratelimit-remaining"]) {
		result.remaining = Number.parseInt(normalized["x-ratelimit-remaining"], 10);
	}
	if (normalized["x-ratelimit-reset"]) {
		result.resetAt = Number.parseInt(normalized["x-ratelimit-reset"], 10);
	}
	if (normalized["retry-after"]) {
		result.retryAfter = Number.parseInt(normalized["retry-after"], 10);
	}

	return result;
};
