import { CircuitBreaker } from "./CircuitBreaker";
import { DEFAULT_CIRCUIT_BREAKER_CONFIG } from "./config";
import type { CircuitBreakerConfig } from "./types";

/**
 * Create circuit breaker with config
 */
export const createCircuitBreaker = (
	config: Partial<CircuitBreakerConfig> = {},
): CircuitBreaker => {
	const fullConfig: CircuitBreakerConfig = {
		...DEFAULT_CIRCUIT_BREAKER_CONFIG,
		...config,
	};

	return new CircuitBreaker(fullConfig);
};
