/**
 * Rate limiter service implementation
 */

import { Effect } from "effect";
import type { RateLimiter, RateLimiterConfig, RateLimitResult } from "./rate-limiter-algorithms";
import { createFixedWindow, createSlidingWindow, createTokenBucket } from "./rate-limiter-algorithms";

// Algorithm implementations
export * from "./rate-limiter-algorithms";

// Core rate limiter factory
export const createRateLimiter = (config: RateLimiterConfig): RateLimiter => {
	switch (config.algorithm) {
		case "token-bucket":
			return createTokenBucket(config);
		case "sliding-window":
			return createSlidingWindow(config);
		case "fixed-window":
			return createFixedWindow(config);
		default:
			throw new Error(`Unknown algorithm: ${config.algorithm}`);
	}
};

// Effect-based rate limiter
export const rateLimitEffect = (
	limiter: RateLimiter,
	key: string,
): Effect.Effect<RateLimitResult, Error> =>
	Effect.tryPromise({
		try: () => limiter.check(key),
		catch: (error) => new Error(`Rate limit check failed: ${error}`),
	});
