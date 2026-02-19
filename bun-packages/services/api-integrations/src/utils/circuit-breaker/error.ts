import type { CircuitBreakerStats, CircuitState } from "./types";

/**
 * Circuit breaker error
 */
export class CircuitBreakerError extends Error {
	constructor(
		message: string = "Circuit breaker is open",
		public readonly state: CircuitState = "open",
		public readonly stats?: CircuitBreakerStats,
	) {
		super(message);
		this.name = "CircuitBreakerError";
	}
}
