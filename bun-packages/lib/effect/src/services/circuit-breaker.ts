import type { Effect } from "../types";
import type { CircuitBreakerConfig, CircuitBreakerMetrics, CircuitBreakerState } from "../types/circuit-breaker";

const defaultConfig: CircuitBreakerConfig = {
	failureThreshold: 5,
	successThreshold: 2,
	timeout: 60000,
	resetTimeout: 10000,
};

export class CircuitBreaker {
	private state: CircuitBreakerState = {
		_tag: "CircuitBreakerState",
		state: "closed",
		failureCount: 0,
		successCount: 0,
	};

	private metrics = {
		totalRequests: 0,
		totalFailures: 0,
		totalSuccesses: 0,
	};

	constructor(private config: CircuitBreakerConfig = defaultConfig) {}

	getState(): CircuitBreakerState {
		return { ...this.state };
	}

	getMetrics(): CircuitBreakerMetrics {
		const failureRate = this.metrics.totalRequests > 0
			? this.metrics.totalFailures / this.metrics.totalRequests
			: 0;
		const successRate = this.metrics.totalRequests > 0
			? this.metrics.totalSuccesses / this.metrics.totalRequests
			: 0;

		return {
			totalRequests: this.metrics.totalRequests,
			totalFailures: this.metrics.totalFailures,
			totalSuccesses: this.metrics.totalSuccesses,
			failureRate,
			successRate,
			state: this.state.state,
		};
	}

	async execute<A, E>(effect: Effect<A, E>): Promise<A> {
		if (this.state.state === "open") {
			if (
				this.state.lastFailureTime
				&& Date.now() - this.state.lastFailureTime > this.config.resetTimeout
			) {
				this.state.state = "half-open";
				this.state.successCount = 0;
			} else {
				throw new Error("Circuit breaker is open");
			}
		}

		this.metrics.totalRequests++;

		try {
			const result = await effect();
			this.onSuccess();
			return result;
		} catch (error) {
			this.onFailure();
			throw error;
		}
	}

	private onSuccess(): void {
		this.metrics.totalSuccesses++;

		if (this.state.state === "half-open") {
			this.state.successCount++;
			if (this.state.successCount >= this.config.successThreshold) {
				this.state.state = "closed";
				this.state.failureCount = 0;
			}
		} else {
			this.state.failureCount = 0;
		}

		this.state.lastSuccessTime = Date.now();
	}

	private onFailure(): void {
		this.metrics.totalFailures++;
		this.state.failureCount++;

		if (this.state.failureCount >= this.config.failureThreshold) {
			this.state.state = "open";
		}

		this.state.lastFailureTime = Date.now();
	}

	reset(): void {
		this.state = {
			_tag: "CircuitBreakerState",
			state: "closed",
			failureCount: 0,
			successCount: 0,
		};
		this.metrics = {
			totalRequests: 0,
			totalFailures: 0,
			totalSuccesses: 0,
		};
	}
}

export const withCircuitBreaker = <A, E>(
	effect: Effect<A, E>,
	config?: CircuitBreakerConfig,
): Effect<A, E> => {
	const breaker = new CircuitBreaker(config);
	return async () => breaker.execute(effect);
};
