/**
 * Rate limiting types
 */

/**
 * Rate limit configuration
 */
export type RateLimitConfig = {
	readonly maxRequests: number;
	readonly windowMs: number;
	readonly strategy: RateLimitStrategy;
};

/**
 * Rate limit strategies
 */
export type RateLimitStrategy = "fixed" | "sliding" | "token_bucket";

/**
 * Rate limit state
 */
export type RateLimitState = {
	readonly remaining: number;
	readonly limit: number;
	readonly resetAt: number;
	readonly windowMs: number;
};

/**
 * Rate limit info from response headers
 */
export type RateLimitInfo = {
	readonly limit?: number;
	readonly remaining?: number;
	readonly resetAt?: number;
	readonly retryAfter?: number;
};
