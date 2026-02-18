export interface CircuitBreakerState {
	readonly _tag: "CircuitBreakerState";
	readonly state: "closed" | "open" | "half-open";
	readonly failureCount: number;
	readonly successCount: number;
	readonly lastFailureTime?: number;
	readonly lastSuccessTime?: number;
}

export interface CircuitBreakerConfig {
	readonly failureThreshold: number;
	readonly successThreshold: number;
	readonly timeout: number;
	readonly resetTimeout: number;
}

export interface CircuitBreakerMetrics {
	readonly totalRequests: number;
	readonly totalFailures: number;
	readonly totalSuccesses: number;
	readonly failureRate: number;
	readonly successRate: number;
	readonly state: "closed" | "open" | "half-open";
}
