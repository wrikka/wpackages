/**
 * Core resilience types
 */

export interface ResilienceConfig {
	readonly timeout?: number;
	readonly retryAttempts?: number;
	readonly circuitBreakerThreshold?: number;
	readonly bulkheadLimit?: number;
	readonly rateLimitRps?: number;
}

export interface ResilienceResult<T> {
	readonly success: boolean;
	readonly data?: T;
	readonly error?: Error;
	readonly metadata?: {
		readonly attempts: number;
		readonly duration?: number;
		readonly circuitBreakerState?: "closed" | "open" | "half-open";
	};
}

export type ResilienceFunction<T, A extends readonly unknown[] = []> = (
	...args: A
) => Promise<ResilienceResult<T>>;

// Export all service types
export * from "./bulkhead";
export * from "./circuit-breaker";
export * from "./fallback";
export * from "./health-check";
export * from "./retry";
export * from "./timeout";
