import { patterns } from "@w/design-pattern";
/**
 * Rate Limiter Implementation
 * Pure functional rate limiting with multiple strategies
 */

import type { RateLimitConfig, RateLimitInfo, RateLimitState, RateLimitStrategy } from "../types";

const { selectFunctionByCondition } = patterns.behavioral.conditionalSelector;

type RateLimiter = FixedWindowRateLimiter | SlidingWindowRateLimiter | TokenBucketRateLimiter;

/**
 * Default rate limit config
 */
export const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
	maxRequests: 100,
	windowMs: 60000, // 1 minute
	strategy: "sliding",
};

/**
 * Fixed Window Rate Limiter
 * Simple: count requests in fixed time windows
 */
export class FixedWindowRateLimiter {
	private requests: number = 0;
	private windowStart: number = Date.now();

	constructor(private readonly config: RateLimitConfig) {}

	/**
	 * Check if request is allowed
	 */
	isAllowed(): boolean {
		this.resetIfNeeded();
		return this.requests < this.config.maxRequests;
	}

	/**
	 * Record a request
	 */
	record(): RateLimitState {
		this.resetIfNeeded();
		this.requests++;

		return this.getState();
	}

	/**
	 * Get current state
	 */
	getState(): RateLimitState {
		this.resetIfNeeded();

		return {
			remaining: Math.max(0, this.config.maxRequests - this.requests),
			limit: this.config.maxRequests,
			resetAt: this.windowStart + this.config.windowMs,
			windowMs: this.config.windowMs,
		};
	}

	/**
	 * Reset if window expired
	 */
	private resetIfNeeded(): void {
		const now = Date.now();
		if (now >= this.windowStart + this.config.windowMs) {
			this.requests = 0;
			this.windowStart = now;
		}
	}
}

/**
 * Sliding Window Rate Limiter
 * More accurate: considers requests in rolling time window
 */
export class SlidingWindowRateLimiter {
	private timestamps: number[] = [];

	constructor(private readonly config: RateLimitConfig) {}

	/**
	 * Check if request is allowed
	 */
	isAllowed(): boolean {
		this.cleanOldRequests();
		return this.timestamps.length < this.config.maxRequests;
	}

	/**
	 * Record a request
	 */
	record(): RateLimitState {
		this.cleanOldRequests();

		const now = Date.now();
		this.timestamps.push(now);

		return this.getState();
	}

	/**
	 * Get current state
	 */
	getState(): RateLimitState {
		this.cleanOldRequests();

		const oldestTimestamp = this.timestamps[0] || Date.now();
		const resetAt = oldestTimestamp + this.config.windowMs;

		return {
			remaining: Math.max(0, this.config.maxRequests - this.timestamps.length),
			limit: this.config.maxRequests,
			resetAt,
			windowMs: this.config.windowMs,
		};
	}

	/**
	 * Remove old requests outside window
	 */
	private cleanOldRequests(): void {
		const now = Date.now();
		const cutoff = now - this.config.windowMs;
		this.timestamps = this.timestamps.filter((ts) => ts > cutoff);
	}
}

/**
 * Token Bucket Rate Limiter
 * Smooth rate limiting with burst capability
 */
export class TokenBucketRateLimiter {
	private tokens: number;
	private lastRefill: number = Date.now();

	constructor(private readonly config: RateLimitConfig) {
		this.tokens = config.maxRequests;
	}

	/**
	 * Check if request is allowed
	 */
	isAllowed(): boolean {
		this.refillTokens();
		return this.tokens >= 1;
	}

	/**
	 * Record a request (consume a token)
	 */
	record(): RateLimitState {
		this.refillTokens();

		if (this.tokens >= 1) {
			this.tokens -= 1;
		}

		return this.getState();
	}

	/**
	 * Get current state
	 */
	getState(): RateLimitState {
		this.refillTokens();

		const refillRate = this.config.maxRequests / this.config.windowMs;
		const tokensNeeded = 1 - this.tokens;
		const msUntilToken = tokensNeeded > 0 ? tokensNeeded / refillRate : 0;

		return {
			remaining: Math.floor(this.tokens),
			limit: this.config.maxRequests,
			resetAt: Date.now() + msUntilToken,
			windowMs: this.config.windowMs,
		};
	}

	/**
	 * Refill tokens based on time elapsed
	 */
	private refillTokens(): void {
		const now = Date.now();
		const elapsed = now - this.lastRefill;

		if (elapsed > 0) {
			const refillRate = this.config.maxRequests / this.config.windowMs;
			const tokensToAdd = elapsed * refillRate;

			this.tokens = Math.min(
				this.config.maxRequests,
				this.tokens + tokensToAdd,
			);
			this.lastRefill = now;
		}
	}
}

/**
 * Create rate limiter based on strategy
 */
export const createRateLimiter = (
	config: Partial<RateLimitConfig> = {},
): RateLimiter => {
	const fullConfig: RateLimitConfig = {
		...DEFAULT_RATE_LIMIT_CONFIG,
		...config,
	};

	return selectFunctionByCondition<RateLimitStrategy, RateLimiter>(
		fullConfig.strategy,
		[
			{
				condition: (s: RateLimitStrategy) => s === "fixed",
				fn: (_s: RateLimitStrategy) => new FixedWindowRateLimiter(fullConfig),
			},
			{
				condition: (s: RateLimitStrategy) => s === "sliding",
				fn: (_s: RateLimitStrategy) => new SlidingWindowRateLimiter(fullConfig),
			},
			{
				condition: (s: RateLimitStrategy) => s === "token_bucket",
				fn: (_s: RateLimitStrategy) => new TokenBucketRateLimiter(fullConfig),
			},
		],
		(_s: RateLimitStrategy) => new SlidingWindowRateLimiter(fullConfig), // Default strategy
	);
};

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
