import type { RateLimitInfo, RateLimitState } from "../../types";

/**
 * Parse rate limit info from response headers
 */
export const parseRateLimitHeaders = (
	headers: Record<string, string | undefined>,
): RateLimitInfo => {
	const limit = headers["x-ratelimit-limit"]
		? Number.parseInt(headers["x-ratelimit-limit"], 10)
		: undefined;

	const remaining = headers["x-ratelimit-remaining"]
		? Number.parseInt(headers["x-ratelimit-remaining"], 10)
		: undefined;

	const reset = headers["x-ratelimit-reset"]
		? Number.parseInt(headers["x-ratelimit-reset"], 10)
		: undefined;

	const retryAfter = headers["retry-after"]
		? Number.parseInt(headers["retry-after"], 10)
		: undefined;

	const result: RateLimitInfo = {
		...(limit !== undefined && { limit }),
		...(remaining !== undefined && { remaining }),
		...(reset !== undefined && { resetAt: reset }),
		...(retryAfter !== undefined && { retryAfter }),
	};

	return result;
};

/**
 * Calculate wait time from rate limit info
 */
export const calculateWaitTime = (info: RateLimitInfo): number => {
	if (info.retryAfter) {
		return info.retryAfter * 1000; // Convert seconds to ms
	}

	if (info.resetAt) {
		const waitTime = info.resetAt * 1000 - Date.now();
		return Math.max(0, waitTime);
	}

	return 0;
};

/**
 * Check if rate limited
 */
export const isRateLimited = (info: RateLimitInfo): boolean => {
	return info.remaining !== undefined && info.remaining <= 0;
};

/**
 * Build rate limit state from headers
 */
export const buildRateLimitState = (
	headers: Record<string, string | undefined>,
	windowMs: number = 60000,
): RateLimitState | null => {
	const info = parseRateLimitHeaders(headers);

	if (info.limit === undefined || info.remaining === undefined) {
		return null;
	}

	return {
		limit: info.limit,
		remaining: info.remaining,
		resetAt: info.resetAt ? info.resetAt * 1000 : Date.now() + windowMs,
		windowMs,
	};
};
