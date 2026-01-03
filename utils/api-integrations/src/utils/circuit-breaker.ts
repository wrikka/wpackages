import { patterns } from "@w/design-pattern";

/**
 * Circuit Breaker Implementation
 * Prevents cascading failures by stopping requests when service is unhealthy
 */

const { selectByCondition } = patterns.behavioral.conditionalSelector;

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

/**
 * Default circuit breaker config
 */
export const DEFAULT_CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig = {
	failureThreshold: 5,
	successThreshold: 2,
	timeout: 60000, // 1 minute
	resetTimeout: 300000, // 5 minutes
};

/**
 * Circuit Breaker Class
 */
export class CircuitBreaker {
	private state: CircuitState = "closed";
	private failures: number = 0;
	private successes: number = 0;
	private consecutiveFailures: number = 0;
	private consecutiveSuccesses: number = 0;
	private lastFailureTime: number | undefined = undefined;
	private lastSuccessTime: number | undefined = undefined;
	private openedAt: number | undefined = undefined;

	constructor(private readonly config: CircuitBreakerConfig) {}

	/**
	 * Check if request is allowed
	 */
	isAllowed(): boolean {
		this.updateState();
		return this.state !== "open";
	}

	/**
	 * Record a successful request
	 */
	recordSuccess(): void {
		this.successes++;
		this.consecutiveSuccesses++;
		this.consecutiveFailures = 0;
		this.lastSuccessTime = Date.now();

		if (this.state === "half_open") {
			if (this.consecutiveSuccesses >= this.config.successThreshold) {
				this.close();
			}
		}
	}

	/**
	 * Record a failed request
	 */
	recordFailure(): void {
		this.failures++;
		this.consecutiveFailures++;
		this.consecutiveSuccesses = 0;
		this.lastFailureTime = Date.now();

		if (this.state === "closed" || this.state === "half_open") {
			if (this.consecutiveFailures >= this.config.failureThreshold) {
				this.open();
			}
		}
	}

	/**
	 * Get current state
	 */
	getState(): CircuitState {
		this.updateState();
		return this.state;
	}

	/**
	 * Get statistics
	 */
	getStats(): CircuitBreakerStats {
		this.updateState();

		const stats: CircuitBreakerStats = {
			state: this.state,
			failures: this.failures,
			successes: this.successes,
			consecutiveFailures: this.consecutiveFailures,
			consecutiveSuccesses: this.consecutiveSuccesses,
			...(this.lastFailureTime !== undefined && { lastFailureTime: this.lastFailureTime }),
			...(this.lastSuccessTime !== undefined && { lastSuccessTime: this.lastSuccessTime }),
		};

		return stats;
	}

	/**
	 * Force open the circuit
	 */
	forceOpen(): void {
		this.open();
	}

	/**
	 * Force close the circuit
	 */
	forceClose(): void {
		this.close();
	}

	/**
	 * Reset all counters
	 */
	reset(): void {
		this.state = "closed";
		this.failures = 0;
		this.successes = 0;
		this.consecutiveFailures = 0;
		this.consecutiveSuccesses = 0;
		this.lastFailureTime = undefined;
		this.lastSuccessTime = undefined;
		this.openedAt = undefined;
	}

	/**
	 * Update state based on time and thresholds
	 */
	private updateState(): void {
		if (this.state === "open") {
			const now = Date.now();
			const timeSinceOpened = now - (this.openedAt || now);

			if (timeSinceOpened >= this.config.timeout) {
				this.halfOpen();
			}
		}

		// Reset failure count after reset timeout
		if (
			this.config.resetTimeout
			&& this.lastFailureTime
			&& this.state === "closed"
		) {
			const now = Date.now();
			const timeSinceFailure = now - this.lastFailureTime;

			if (timeSinceFailure >= this.config.resetTimeout) {
				this.consecutiveFailures = 0;
			}
		}
	}

	/**
	 * Open the circuit
	 */
	private open(): void {
		this.state = "open";
		this.openedAt = Date.now();
	}

	/**
	 * Half-open the circuit
	 */
	private halfOpen(): void {
		this.state = "half_open";
		this.consecutiveSuccesses = 0;
		this.openedAt = undefined;
	}

	/**
	 * Close the circuit
	 */
	private close(): void {
		this.state = "closed";
		this.consecutiveFailures = 0;
		this.openedAt = undefined;
	}
}

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

/**
 * Calculate circuit breaker health score (0-100)
 */
export const calculateHealthScore = (stats: CircuitBreakerStats): number => {
	const total = stats.failures + stats.successes;

	if (total === 0) {
		return 100;
	}

	const successRate = (stats.successes / total) * 100;

	return selectByCondition(
		stats.state,
		[
			{ condition: (state: CircuitState) => state === "open", result: 0 },
			{ condition: (state: CircuitState) => state === "half_open", result: successRate * 0.7 },
		],
		successRate, // Default for "closed"
	);
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
