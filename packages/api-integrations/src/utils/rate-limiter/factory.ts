import type { RateLimitConfig } from "../../types";
import { DEFAULT_RATE_LIMIT_CONFIG } from "./config";
import { FixedWindowRateLimiter } from "./strategies/fixed-window";
import { SlidingWindowRateLimiter } from "./strategies/sliding-window";
import { TokenBucketRateLimiter } from "./strategies/token-bucket";

type RateLimiter = FixedWindowRateLimiter | SlidingWindowRateLimiter | TokenBucketRateLimiter;

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

	switch (fullConfig.strategy) {
		case "fixed":
			return new FixedWindowRateLimiter(fullConfig);
		case "sliding":
			return new SlidingWindowRateLimiter(fullConfig);
		case "token_bucket":
			return new TokenBucketRateLimiter(fullConfig);
		default:
			return new SlidingWindowRateLimiter(fullConfig); // Default strategy
	}
};
