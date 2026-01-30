import type { RateLimitConfig, RateLimitState } from "../../../types";

/**
 * Fixed Window Rate Limiter
 * Simple: count requests in fixed time windows
 */
export class FixedWindowRateLimiter {
	private requests: number = 0;
	private windowStart: number = Date.now();

	constructor(private readonly config: RateLimitConfig) {}

	isAllowed(): boolean {
		this.resetIfNeeded();
		return this.requests < this.config.maxRequests;
	}

	record(): RateLimitState {
		this.resetIfNeeded();
		this.requests++;

		return this.getState();
	}

	getState(): RateLimitState {
		this.resetIfNeeded();

		return {
			remaining: Math.max(0, this.config.maxRequests - this.requests),
			limit: this.config.maxRequests,
			resetAt: this.windowStart + this.config.windowMs,
			windowMs: this.config.windowMs,
		};
	}

	private resetIfNeeded(): void {
		const now = Date.now();
		if (now >= this.windowStart + this.config.windowMs) {
			this.requests = 0;
			this.windowStart = now;
		}
	}
}
