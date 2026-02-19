/**
 * Circuit breaker types
 */

export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export type CircuitBreakerConfig = {
	readonly failureThreshold: number;
	readonly successThreshold: number;
	readonly timeout: number;
	readonly resetTimeout?: number;
	readonly onStateChange?: (from: CircuitState, to: CircuitState) => void;
	readonly onSuccess?: () => void;
	readonly onFailure?: (error: Error) => void;
	readonly shouldTrip?: (error: Error) => boolean;
};

export type CircuitBreakerState = {
	readonly state: CircuitState;
	readonly failureCount: number;
	readonly successCount: number;
	readonly lastFailureTime: number;
	readonly nextAttemptTime: number;
};

export type CircuitBreakerStats = {
	readonly state: CircuitState;
	readonly totalCalls: number;
	readonly successCalls: number;
	readonly failureCalls: number;
	readonly rejectedCalls: number;
	readonly failureRate: number;
};

export type CircuitBreaker<T = unknown> = {
	readonly execute: <R = T>(fn: () => Promise<R>) => Promise<R>;
	readonly getState: () => CircuitBreakerState;
	readonly getStats: () => CircuitBreakerStats;
	readonly reset: () => void;
	readonly forceOpen: () => void;
	readonly forceClosed: () => void;
};
