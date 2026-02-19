import type { CircuitBreakerConfig, CircuitBreakerStats, CircuitState } from "./types";

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

	isAllowed(): boolean {
		this.updateState();
		return this.state !== "open";
	}

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

	getState(): CircuitState {
		this.updateState();
		return this.state;
	}

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

	forceOpen(): void {
		this.open();
	}

	forceClose(): void {
		this.close();
	}

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

	private updateState(): void {
		if (this.state === "open") {
			const now = Date.now();
			const timeSinceOpened = now - (this.openedAt || now);

			if (timeSinceOpened >= this.config.timeout) {
				this.halfOpen();
			}
		}

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

	private open(): void {
		this.state = "open";
		this.openedAt = Date.now();
	}

	private halfOpen(): void {
		this.state = "half_open";
		this.consecutiveSuccesses = 0;
		this.openedAt = undefined;
	}

	private close(): void {
		this.state = "closed";
		this.consecutiveFailures = 0;
		this.openedAt = undefined;
	}
}
