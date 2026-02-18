# Getting Started

## Installation

```bash
bun add @wpackages/effect
```

## Basic Usage

### Creating Effects

```typescript
import { Effect, fail, succeed, sync, tryPromise } from "@wpackages/effect";

// Success effect
const successEffect = succeed(42);

// Failure effect
const failureEffect = fail({ message: "Something went wrong" });

// Sync effect
const syncEffect = sync(() => {
	return Math.random();
});

// Async effect
const asyncEffect = tryPromise(
	() => fetch("https://api.example.com/data"),
	(error) => ({ message: "Failed to fetch", error }),
);
```

### Running Effects

```typescript
import { runPromise, runSync } from "@wpackages/effect";

// Run async effect
const result = await runPromise(successEffect);
if (result._tag === "Success") {
	console.log(result.value); // 42
}

// Run sync effect
const syncResult = runSync(syncEffect);
```

### Using Generators

```typescript
import { gen } from "@wpackages/effect";

const program = gen(function*() {
	const a = yield* succeed(1);
	const b = yield* succeed(2);
	const c = yield* succeed(3);
	return succeed(a + b + c);
});

const result = await runPromise(program);
console.log(result.value); // 6
```

### Using Combinators

```typescript
import { all, flatMap, map, pipe } from "@wpackages/effect";

const effect = succeed(1);

// Map
const doubled = pipe(
	effect,
	map((x) => x * 2),
);

// FlatMap
const added = pipe(
	effect,
	flatMap((x) => succeed(x + 10)),
);

// All
const allResult = await runPromise(all([succeed(1), succeed(2), succeed(3)]));
console.log(allResult.value); // [1, 2, 3]
```

### Error Handling

```typescript
import { tryCatch, tryPromise } from "@wpackages/effect";

// Try-catch for sync operations
const safeDivide = (a: number, b: number) =>
	tryCatch(
		() => a / b,
		(error) => ({ message: "Division by zero", error }),
	);

// Try-promise for async operations
const safeFetch = (url: string) =>
	tryPromise(
		() => fetch(url).then((r) => r.json()),
		(error) => ({ message: "Fetch failed", error }),
	);
```

### Resilience Patterns

```typescript
import {
	exponential,
	recurs,
	retry,
	withBulkhead,
	withCircuitBreaker,
	withRateLimiter,
} from "@wpackages/effect";

// Retry with exponential backoff
const retriedEffect = retry(
	asyncEffect,
	exponential(1000, 2),
);

// Circuit breaker
const circuitBreakerEffect = withCircuitBreaker(
	asyncEffect,
	{
		failureThreshold: 5,
		successThreshold: 2,
		timeout: 60000,
		resetTimeout: 10000,
	},
);

// Bulkhead
const bulkheadEffect = withBulkhead(
	asyncEffect,
	{ maxConcurrent: 10, maxQueueSize: 100 },
);

// Rate limiter
const rateLimitedEffect = withRateLimiter(
	asyncEffect,
	{ maxRequests: 100, windowMs: 60000 },
);
```

### Resource Management

```typescript
import { acquireRelease, pool, using } from "@wpackages/effect";

// Acquire and release
const withConnection = using(
	acquireRelease(
		async () => await createConnection(),
		(conn) => async () => await conn.close(),
	),
	(conn) => async () => {
		return await conn.query("SELECT * FROM users");
	},
);

// Resource pool
const connectionPool = pool(
	() => createConnection(),
	10,
);
```

### Stream Processing

```typescript
import {
	filter,
	fromArray,
	map,
	reduce,
	toArray,
} from "@wpackages/effect/stream";

const stream = fromArray([1, 2, 3, 4, 5]);

const result = await runPromise(
	pipe(
		stream,
		map((x) => x * 2),
		filter((x) => x > 5),
		reduce((acc, x) => acc + x, 0),
	),
);
console.log(result.value); // 24 (8 + 10 + 12)
```

### Observable Pattern

```typescript
import {
	createObservable,
	createSubject,
	debounceTime,
	filter,
	map,
} from "@wpackages/effect/observable";

const observable = createObservable((observer) => {
	let count = 0;
	const interval = setInterval(() => {
		observer.next(count++);
		if (count >= 10) {
			observer.complete();
			clearInterval(interval);
		}
	}, 100);

	return () => clearInterval(interval);
});

const subscription = observable.subscribe({
	next: (value) => console.log("Received:", value),
	error: (error) => console.error("Error:", error),
	complete: () => console.log("Completed"),
});
```

### Testing Utilities

```typescript
import {
	assertCalled,
	assertCalledWith,
	createMock,
	createStub,
} from "@wpackages/effect/testing";

const mock = createMock<number, Error>();
const stub = createStub<number, Error>(42);

// Test assertions
assertCalled(mock);
assertCalledWith(mock, 1, 2, 3);
```

## Next Steps

- [Combinators Guide](./combinators.md)
- [Resilience Patterns](./resilience.md)
- [Stream Processing](./stream.md)
- [Observable Pattern](./observable.md)
- [Resource Management](./resource.md)
- [Testing](./testing.md)
