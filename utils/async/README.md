# @wpackages/async

## Introduction

`@wpackages/async` is a lightweight, zero-dependency utility library that provides a collection of essential, promise-based helpers for managing asynchronous operations in TypeScript. It offers simple, robust, and well-tested implementations for common async patterns.

## Features

- ⏱️ **`sleep`**: A promise-based function to pause execution for a specified duration.
- ⌛ **`timeout`**: A utility to race a promise against a timer, rejecting it if it doesn't resolve within a specified timeframe.
- deferred **`defer`**: Creates a deferred promise, allowing you to resolve or reject it from outside the promise constructor.
- 📦 **Zero Dependencies**: Written in pure TypeScript with no external dependencies.
- 🔒 **Type-Safe**: Provides a fully type-safe API.

## Goal

- 🎯 **Simplify Async Code**: To provide simple, reliable solutions for common asynchronous tasks.
- 🧩 **Composability**: To offer small, focused utilities that can be easily composed to build more complex async logic.
- 🧑‍💻 **Improve Readability**: To make asynchronous code more readable and easier to reason about.

## Design Principles

- **Minimalism**: Each utility has a small, focused API that does one thing well.
- **Standard-Compliant**: Built on standard JavaScript promises for maximum compatibility.
- **Reliability**: Each function is thoroughly tested to ensure it behaves as expected in all edge cases.

## Installation

This is a workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

Import the desired function from the package.

### `sleep`

Pause execution for a given number of milliseconds.

```typescript
import { sleep } from "@wpackages/async";

async function main() {
	console.log("Hello");
	await sleep(1000); // Wait for 1 second
	console.log("World");
}

main();
```

### `timeout`

Wrap a promise to ensure it resolves within a specific duration.

```typescript
import { timeout } from "@wpackages/async";

const longRunningTask = new Promise(resolve =>
	setTimeout(() => resolve("done"), 5000)
);

try {
	// This will throw an error because the task takes longer than 1 second
	await timeout(longRunningTask, 1000);
} catch (error) {
	console.error(error.message); // 'Promise timed out after 1000ms'
}
```

### `defer`

Create a promise that can be controlled externally.

```typescript
import { defer } from "@wpackages/async";

const deferred = defer<string>();

// The promise will remain pending...
deferred.promise.then(value => console.log(`Resolved with: ${value}`));

// ...until it is resolved or rejected elsewhere in the code.
setTimeout(() => {
	deferred.resolve("Hello from the future!");
}, 2000);
```

## License

This project is licensed under the MIT License.
