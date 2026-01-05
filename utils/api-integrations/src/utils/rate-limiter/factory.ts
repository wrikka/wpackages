import { createSelector } from "@wpackages/design-pattern";
import type { RateLimitConfig, RateLimitStrategy } from "../../types";
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

	return createSelector<RateLimitStrategy, RateLimiter>(
		[
			{
				condition: (s: RateLimitStrategy) => s === "fixed",
				result: new FixedWindowRateLimiter(fullConfig),
			},
			{
				condition: (s: RateLimitStrategy) => s === "sliding",
				result: new SlidingWindowRateLimiter(fullConfig),
			},
			{
				condition: (s: RateLimitStrategy) => s === "token_bucket",
				result: new TokenBucketRateLimiter(fullConfig),
			},
		],
		new SlidingWindowRateLimiter(fullConfig), // Default strategy
	)(fullConfig.strategy);
};
