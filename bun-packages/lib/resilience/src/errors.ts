/**
 * Custom error types for resilience patterns.
 */

export class TimeoutError extends Error {
	readonly isTimeout = true;

	constructor(message?: string) {
		super(message || "Operation timed out");
		this.name = "TimeoutError";
	}
}

export class CircuitBreakerOpenError extends Error {
	readonly isCircuitBreakerOpen = true;

	constructor(message?: string) {
		super(message || "Circuit breaker is open");
		this.name = "CircuitBreakerOpenError";
	}
}

export class BulkheadRejectionError extends Error {
	readonly isBulkheadRejection = true;

	constructor(message?: string) {
		super(message || "Bulkhead capacity exceeded");
		this.name = "BulkheadRejectionError";
	}
}

export class RateLimitExceededError extends Error {
	readonly isRateLimitExceeded = true;

	constructor(message?: string) {
		super(message || "Rate limit exceeded");
		this.name = "RateLimitExceededError";
	}
}
