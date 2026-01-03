# concurrency

> Functional concurrency utilities for async operations and parallel processing

Production-grade async operations and parallel processing following functional programming principles.

## Features

- ✅ **Async Utilities** - Retry, sleep, timeout functions
- ✅ **Rate Limiting** - Control the rate of async operations
- ✅ **Debouncing** - Limit the rate of function calls
- ✅ **Throttling** - Control the frequency of function calls
- ✅ **Mutex** - Mutual exclusion for async operations
- ✅ **Functional** - Pure functions, immutable data structures
- ✅ **Type-safe** - Full TypeScript support with comprehensive type definitions

## Installation

```sh
# Using npm
npm install concurrency

# Using yarn
yarn add concurrency

# Using pnpm
pnpm add concurrency

# Using bun
bun add concurrency
```

## Quick Start

### 1. Async Utilities

```typescript
import { retry, sleep, timeout } from "concurrency";

// Retry a function with exponential backoff
const result = await retry(
	async () => {
		// Some operation that might fail
		return await fetch("https://api.example.com/data");
	},
	{
		maxAttempts: 3,
		strategy: "exponential",
		baseDelay: 1000,
	},
);

// Sleep for a specified time
await sleep(1000); // Sleep for 1 second

// Add timeout to a function
const timeoutResult = await timeout(
	async () => {
		return await longRunningOperation();
	},
	5000, // 5 second timeout
);
```

### 2. Rate Limiting

```typescript
import { createRateLimiter } from "concurrency";

const limiter = createRateLimiter({
	maxRequests: 10,
	timeWindow: 1000, // 10 requests per second
});

const result = await limiter.execute(async () => {
	return await apiCall();
});
```

### 3. Debouncing

```typescript
import { debounce } from "concurrency";

const debouncedSearch = debounce(
	async (query: string) => {
		return await searchApi(query);
	},
	300, // 300ms delay
);

// This will only execute after 300ms of no calls
await debouncedSearch("search term");
```

### 4. Throttling

```typescript
import { throttle } from "concurrency";

const throttledFunction = throttle(
	async (data: any) => {
		return await processData(data);
	},
	1000, // Execute at most once per second
);

// This will execute immediately, then at most once per second
await throttledFunction(data);
```

### 5. Mutex

```typescript
import { createMutex } from "concurrency";

const mutex = createMutex();

// Only one of these operations will execute at a time
const result1 = await mutex.acquire(async () => {
	return await criticalOperation();
});

const result2 = await mutex.acquire(async () => {
	return await anotherCriticalOperation();
});
```

## API Reference

### Async Utilities

```typescript
// Retry
retry(fn, options);
interface RetryOptions {
	maxAttempts?: number;
	strategy?: "fixed" | "linear" | "exponential";
	baseDelay?: number;
	maxDelay?: number;
	shouldRetry?: (error: Error) => boolean;
}

// Sleep
sleep(ms);

// Timeout
timeout(fn, ms);
```

### Rate Limiting

```typescript
// Rate limiter
createRateLimiter(config);
interface RateLimiterConfig {
	maxRequests: number;
	timeWindow: number; // milliseconds
}

rateLimiter.execute(fn);
```

### Debouncing

```typescript
// Debounce
debounce(fn, delay);
```

### Throttling

```typescript
// Throttle
throttle(fn, delay);
```

### Mutex

```typescript
// Mutex
createMutex();
mutex.acquire(fn);
```

## Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) before submitting pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

MIT © [WTS Framework](LICENSE)
