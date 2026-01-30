import type { Effect } from "../types";
import type { BulkheadConfig, BulkheadMetrics, RateLimiterConfig } from "../types/bulkhead";

export class Bulkhead {
	private activeRequests = 0;
	private queuedRequests: Array<() => void> = [];
	private rejectedRequests = 0;

	constructor(private config: BulkheadConfig) {}

	async execute<A, E>(effect: Effect<A, E>): Promise<A> {
		if (this.activeRequests >= this.config.maxConcurrent) {
			if (this.queuedRequests.length >= this.config.maxQueueSize) {
				this.rejectedRequests++;
				throw new Error("Bulkhead limit exceeded");
			}

			await new Promise<void>((resolve) => {
				this.queuedRequests.push(resolve);
			});
		}

		this.activeRequests++;

		try {
			return await effect();
		} finally {
			this.activeRequests--;

			if (this.queuedRequests.length > 0) {
				const next = this.queuedRequests.shift();
				if (next) next();
			}
		}
	}

	getMetrics(): BulkheadMetrics {
		return {
			activeRequests: this.activeRequests,
			queuedRequests: this.queuedRequests.length,
			rejectedRequests: this.rejectedRequests,
		};
	}
}

export class RateLimiter {
	private requests: number[] = [];

	constructor(private config: RateLimiterConfig) {}

	async execute<A, E>(effect: Effect<A, E>): Promise<A> {
		const now = Date.now();
		this.requests = this.requests.filter((time) => now - time < this.config.windowMs);

		if (this.requests.length >= this.config.maxRequests) {
			throw new Error("Rate limit exceeded");
		}

		this.requests.push(now);

		return await effect();
	}

	getMetrics() {
		return {
			requestsInWindow: this.requests.length,
			maxRequests: this.config.maxRequests,
		};
	}
}

export const withBulkhead = <A, E>(
	effect: Effect<A, E>,
	config: BulkheadConfig,
): Effect<A, E> => {
	const bulkhead = new Bulkhead(config);
	return async () => bulkhead.execute(effect);
};

export const withRateLimiter = <A, E>(
	effect: Effect<A, E>,
	config: RateLimiterConfig,
): Effect<A, E> => {
	const limiter = new RateLimiter(config);
	return async () => limiter.execute(effect);
};
