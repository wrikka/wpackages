# API Documentation

This document provides an overview of the public API for `@wpackages/resilience`.

## Core Functions

### `createResilientEffect`

Creates a resilient `Effect` by wrapping a base `Effect` with the configured resilience patterns.

**Signature:**

```typescript
export const createResilientEffect = <T>(
  effect: Effect.Effect<T, Error>,
  config: ResilienceConfig = {},
): Effect.Effect<T, Error>
```

- **`effect`**: The `Effect.Effect<T, Error>` to make resilient.
- **`config`**: A `ResilienceConfig` object to specify which patterns to apply.
- **Returns**: A new, composed `Effect.Effect<T, Error>`.

### `run`

Executes a Promise-returning function with resilience patterns and returns a standardized `ResilienceResult`.

**Signature:**

```typescript
export const run = async <T>(
  operation: () => Promise<T>,
  config: ResilienceConfig = {},
): Promise<ResilienceResult<T>>
```

- **`operation`**: A function that returns a `Promise`.
- **`config`**: A `ResilienceConfig` object.
- **Returns**: A `Promise` that resolves to a `ResilienceResult<T>`.

## Core Types

### `ResilienceConfig`

An interface for configuring the resilience patterns.

```typescript
export interface ResilienceConfig {
	readonly timeout?: number; // Timeout in milliseconds
	readonly retryAttempts?: number; // Number of retry attempts
	readonly circuitBreakerThreshold?: number; // Failure threshold for circuit breaker
	readonly bulkheadLimit?: number; // Concurrency limit for bulkhead
	readonly rateLimitRps?: number; // Requests per second for rate limiting
}
```

### `ResilienceResult`

A standardized result object for resilient operations.

```typescript
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
```
