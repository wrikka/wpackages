import { CircuitBreaker } from "./CircuitBreaker";
import type { CircuitBreakerStats } from "./types";

/**
 * Calculate circuit breaker health score (0-100)
 */
export const calculateHealthScore = (stats: CircuitBreakerStats): number => {
	const total = stats.failures + stats.successes;

	if (total === 0) {
		return 100;
	}

	const successRate = (stats.successes / total) * 100;

	if (stats.state === "open") {
		return 0;
	}
	if (stats.state === "half_open") {
		return successRate * 0.7;
	}

	return successRate; // Default for "closed"
};

/**
 * Check if circuit breaker is healthy
 */
export const isCircuitHealthy = (
	circuitBreaker: CircuitBreaker,
	minHealthScore: number = 70,
): boolean => {
	const stats = circuitBreaker.getStats();
	const healthScore = calculateHealthScore(stats);
	return healthScore >= minHealthScore;
};
