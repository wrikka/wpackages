import type { RateLimitConfig } from "../../types";

/**
 * Default rate limit config
 */
export const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
	maxRequests: 100,
	windowMs: 60000, // 1 minute
	strategy: "sliding",
};
