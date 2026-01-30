import type { RateLimitConfig, RateLimitState } from "../../../types";

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

	isAllowed(): boolean {
		this.refillTokens();
		return this.tokens >= 1;
	}

	record(): RateLimitState {
		this.refillTokens();

		if (this.tokens >= 1) {
			this.tokens -= 1;
		}

		return this.getState();
	}

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
