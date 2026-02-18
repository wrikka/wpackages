# Resilience Patterns Guide

## Overview

Resilience patterns ช่วยให้ application ของคุณทนทานต่อ failures และ recover ได้อย่างรวดเร็ว

## Circuit Breaker

Circuit breaker ช่วยป้องกัน cascading failures:

```typescript
import { runPromise, tryPromise, withCircuitBreaker } from "@wpackages/effect";

const fetchWithCircuitBreaker = withCircuitBreaker(
	tryPromise(
		() => fetch("https://api.example.com/data"),
		(error) => ({ message: "Fetch failed", error }),
	),
	{
		failureThreshold: 5,
		successThreshold: 2,
		timeout: 60000,
		resetTimeout: 10000,
	},
);

const result = await runPromise(fetchWithCircuitBreaker);
```

### Retry with Jitter

Retry operations ด้วย exponential backoff และ jitter:

```typescript
import {
	exponential,
	fullJitter,
	retryWithJitter,
	runPromise,
	tryPromise,
} from "@wpackages/effect";

const retriedEffect = retryWithJitter(
	tryPromise(
		() => fetch("https://api.example.com/data"),
		(error) => ({ message: "Fetch failed", error }),
	),
	{
		maxRetries: 3,
		baseDelay: 1000,
		maxDelay: 10000,
		jitter: exponential(1000, 2),
	},
);

const result = await runPromise(retriedEffect);
```

### Jitter Strategies

```typescript
import { decorrelatedJitter, equalJitter, fullJitter } from "@wpackages/effect";

// Full jitter: random delay between 0 and baseDelay
const fullJitterStrategy = fullJitter;

// Equal jitter: delay between baseDelay/2 and baseDelay
const equalJitterStrategy = equalJitter;

// Decorrelated jitter: delay = baseDelay * (0.5 + random)
const decorrelatedJitterStrategy = decorrelatedJitter;
```

### Bulkhead

Limit concurrent operations:

```typescript
import { runPromise, tryPromise, withBulkhead } from "@wpackages/effect";

const bulkheadEffect = withBulkhead(
	tryPromise(
		() => fetch("https://api.example.com/data"),
		(error) => ({ message: "Fetch failed", error }),
	),
	{
		maxConcurrent: 10,
		maxQueueSize: 100,
	},
);

const result = await runPromise(bulkheadEffect);
```

### Rate Limiter

Limit request rate:

```typescript
import { runPromise, tryPromise, withRateLimiter } from "@wpackages/effect";

const rateLimitedEffect = withRateLimiter(
	tryPromise(
		() => fetch("https://api.example.com/data"),
		(error) => ({ message: "Fetch failed", error }),
	),
	{
		maxRequests: 100,
		windowMs: 60000,
	},
);

const result = await runPromise(rateLimitedEffect);
```

### Timeout

Set timeout for operations:

```typescript
import {
	runPromise,
	timeout,
	TimeoutError,
	tryPromise,
} from "@wpackages/effect";

const timeoutEffect = timeout(
	tryPromise(
		() => fetch("https://api.example.com/data"),
		(error) => ({ message: "Fetch failed", error }),
	),
	5000,
	() => new TimeoutError("Operation timed out"),
);

const result = await runPromise(timeoutEffect);
```

### Combining Resilience Patterns

```typescript
import {
	exponential,
	pipe,
	retryWithJitter,
	runPromise,
	timeout,
	TimeoutError,
	tryPromise,
	withBulkhead,
	withCircuitBreaker,
} from "@wpackages/effect";

const resilientEffect = pipe(
	tryPromise(
		() => fetch("https://api.example.com/data"),
		(error) => ({ message: "Fetch failed", error }),
	),
	// Retry with exponential backoff
	retryWithJitter({
		maxRetries: 3,
		baseDelay: 1000,
		maxDelay: 10000,
		jitter: exponential(1000, 2),
	}),
	// Circuit breaker
	withCircuitBreaker({
		failureThreshold: 5,
		successThreshold: 2,
		timeout: 60000,
		resetTimeout: 10000,
	}),
	// Bulkhead
	withBulkhead({
		maxConcurrent: 10,
		maxQueueSize: 100,
	}),
	// Timeout
	timeout(
		5000,
		() => new TimeoutError("Operation timed out"),
	),
);

const result = await runPromise(resilientEffect);
```

## Monitoring

### Circuit Breaker Metrics

```typescript
import { CircuitBreaker } from "@wpackages/effect";

const breaker = new CircuitBreaker({
	failureThreshold: 5,
	successThreshold: 2,
	timeout: 60000,
	resetTimeout: 10000,
});

// Get metrics
const metrics = breaker.getMetrics();
console.log({
	totalRequests: metrics.totalRequests,
	totalFailures: metrics.totalFailures,
	totalSuccesses: metrics.totalSuccesses,
	failureRate: metrics.failureRate,
	successRate: metrics.successRate,
	state: metrics.state,
});

// Get state
const state = breaker.getState();
console.log({
	state: state.state,
	failureCount: state.failureCount,
	successCount: state.successCount,
});
```

### Bulkhead Metrics

```typescript
import { Bulkhead } from "@wpackages/effect";

const bulkhead = new Bulkhead({
	maxConcurrent: 10,
	maxQueueSize: 100,
});

// Get metrics
const metrics = bulkhead.getMetrics();
console.log({
	activeRequests: metrics.activeRequests,
	queuedRequests: metrics.queuedRequests,
	rejectedRequests: metrics.rejectedRequests,
});
```

## Best Practices

1. **Use circuit breaker** สำหรับ external services
2. **Use retry** สำหรับ transient failures
3. **Use bulkhead** สำหรับ limiting concurrent operations
4. **Use rate limiter** สำหรับ API rate limits
5. **Combine patterns** สำหรับ maximum resilience
6. **Monitor metrics** สำหรับ observability
7. **Set appropriate timeouts** สำหรับ preventing hangs
8. **Use jitter** สำหรับ preventing thundering herd
