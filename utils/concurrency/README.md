# @wpackages/concurrency

## Introduction

`@wpackages/concurrency` is a collection of functional, type-safe utilities for managing asynchronous operations and parallel processing in TypeScript. It provides production-grade helpers for common concurrency patterns like retries, rate limiting, debouncing, throttling, and mutual exclusion.

## Features

- 🔁 **Retry Logic**: A powerful `retry` function with configurable strategies like exponential backoff.
- 🚦 **Rate Limiting**: Control the rate of asynchronous operations to avoid overwhelming APIs.
- debounce **Debouncing**: A `debounce` utility to delay function execution until after a certain period of inactivity.
- ⏳ **Throttling**: A `throttle` utility to ensure a function is executed at most once per specified time window.
- 🔒 **Mutex**: A mutual exclusion primitive to ensure that only one async operation can access a critical section at a time.
- 🧩 **Functional and Type-Safe**: Designed with pure functions and full TypeScript support for robust, predictable code.

## Goal

- 🎯 **Simplify Concurrency**: To provide simple, declarative APIs for complex asynchronous and concurrent operations.
- 💪 **Increase Robustness**: To make it easy to build resilient applications that can gracefully handle failures and manage load.
- 🧑‍💻 **Improve Readability**: To offer clear, expressive utilities that make asynchronous code easier to read and reason about.

## Design Principles

- **Functional**: Built with pure functions and immutable data structures where possible.
- **Composability**: Utilities are designed to be easily composed with each other and with standard Promises or `Effect`s.
- **Minimalism**: Each utility is small, focused, and does one thing well.

## Installation

This is a workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

Import the desired utilities from the package.

### Retrying an Operation

```typescript
import { retry } from "@wpackages/concurrency";

const fetchWithRetry = () =>
	retry(() => fetch("https://api.example.com/data"), {
		maxAttempts: 3,
		strategy: "exponential",
		baseDelay: 1000, // 1 second
	});

const response = await fetchWithRetry();
```

### Rate Limiting API Calls

```typescript
import { createRateLimiter } from "@wpackages/concurrency";

// Allow 10 requests per second
const limiter = createRateLimiter({ maxRequests: 10, timeWindow: 1000 });

async function makeApiCall() {
	return limiter.execute(() => fetch("..."));
}
```

### Debouncing User Input

```typescript
import { debounce } from "@wpackages/concurrency";

const handleSearchInput = debounce((query: string) => {
	console.log(`Searching for: ${query}`);
}, 300);

// User types 'h', 'e', 'l', 'l', 'o'
handleSearchInput("h");
handleSearchInput("he");
handleSearchInput("hel"); // The console.log will only fire once, 300ms after this call.
```

## License

This project is licensed under the MIT License.
