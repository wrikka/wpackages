import type { CircuitBreakerConfig } from "./types";

/**
 * Default circuit breaker config
 */
export const DEFAULT_CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig = {
	failureThreshold: 5,
	successThreshold: 2,
	timeout: 60000, // 1 minute
	resetTimeout: 300000, // 5 minutes
};
