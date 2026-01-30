/**
 * Circuit breaker states
 */
export type CircuitState = "closed" | "open" | "half_open";

/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerConfig {
	readonly failureThreshold: number; // Number of failures before opening
	readonly successThreshold: number; // Number of successes to close from half-open
	readonly timeout: number; // Time in ms before trying half-open
	readonly resetTimeout?: number; // Time to reset failure count (optional)
}

/**
 * Circuit breaker statistics
 */
export interface CircuitBreakerStats {
	readonly state: CircuitState;
	readonly failures: number;
	readonly successes: number;
	readonly lastFailureTime?: number;
	readonly lastSuccessTime?: number;
	readonly consecutiveFailures: number;
	readonly consecutiveSuccesses: number;
}
