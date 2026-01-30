import { CircuitBreaker } from "./CircuitBreaker";
import { CircuitBreakerError } from "./error";

/**
 * Execute function with circuit breaker
 */
export async function executeWithCircuitBreaker<T>(
	circuitBreaker: CircuitBreaker,
	fn: () => Promise<T>,
): Promise<T> {
	if (!circuitBreaker.isAllowed()) {
		throw new CircuitBreakerError(
			"Circuit breaker is open",
			circuitBreaker.getState(),
			circuitBreaker.getStats(),
		);
	}

	try {
		const result = await fn();
		circuitBreaker.recordSuccess();
		return result;
	} catch (error) {
		circuitBreaker.recordFailure();
		throw error;
	}
}

/**
 * Create a wrapped function with circuit breaker
 */
export function withCircuitBreaker<T extends unknown[], R>(
	circuitBreaker: CircuitBreaker,
	fn: (...args: T) => Promise<R>,
): (...args: T) => Promise<R> {
	return async (...args: T): Promise<R> => {
		return executeWithCircuitBreaker(circuitBreaker, () => fn(...args));
	};
}
