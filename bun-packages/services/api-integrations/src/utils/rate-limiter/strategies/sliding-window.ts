import type { RateLimitConfig, RateLimitState } from "../../../types";

/**
 * Sliding Window Rate Limiter
 * More accurate: considers requests in rolling time window
 */
export class SlidingWindowRateLimiter {
	private timestamps: number[] = [];

	constructor(private readonly config: RateLimitConfig) {}

	isAllowed(): boolean {
		this.cleanOldRequests();
		return this.timestamps.length < this.config.maxRequests;
	}

	record(): RateLimitState {
		this.cleanOldRequests();

		const now = Date.now();
		this.timestamps.push(now);

		return this.getState();
	}

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

	private cleanOldRequests(): void {
		const now = Date.now();
		const cutoff = now - this.config.windowMs;
		this.timestamps = this.timestamps.filter((ts) => ts > cutoff);
	}
}
