# @wpackages/cache

## Introduction

`@wpackages/cache` is a comprehensive, functional caching library for TypeScript applications. It provides a rich set of tools for improving performance, including memoization, time-to-live (TTL) expiration, Least Recently Used (LRU) eviction policies, and lazy evaluation, all wrapped in a type-safe, functional API.

## Features

- 🧠 **Memoization**: Automatically cache the results of expensive function calls.
- ⏱️ **TTL Support**: Set time-to-live expirations for cache entries to manage data freshness.
- 🗑️ **LRU Eviction**: Automatically remove the least recently used entries when the cache reaches its maximum size.
- 😴 **Lazy Evaluation**: Defer expensive computations until their results are actually needed, with the result being cached for subsequent access.
- 🧩 **Functional Design**: Built with pure functions and immutable data structures for predictable and testable code.
- 🔒 **Type-Safe**: Full TypeScript support ensures that all cache interactions are type-safe.

## Goal

- 🎯 **High Performance**: To provide a suite of powerful tools for optimizing application performance by reducing redundant computations.
- 🧑‍💻 **Excellent DX**: To offer a simple, intuitive, and functional API for common caching patterns.
- 💪 **Robust and Reliable**: To create a caching solution that is predictable, well-tested, and easy to reason about.

## Design Principles

- **Purity**: The core logic is implemented with pure functions, making it easy to test and compose.
- **Immutability**: The library is designed to work with immutable data, avoiding unexpected side effects.
- **Composability**: Caching utilities are designed to be easily composed with other functional constructs.

## Installation

This is a workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

The library offers several high-level utilities for different caching strategies.

### Example: Basic Caching

Create a cache instance with a specific configuration.

```typescript
import { createCache } from "@wpackages/cache";

const cache = createCache<string, number>({
	maxSize: 100, // Max 100 items
	ttl: 5 * 60 * 1000, // 5-minute TTL
	lru: true, // Enable LRU eviction
});

cache.set("my-key", 123);
const value = cache.get("my-key"); // Returns 123
```

### Example: Memoization

Automatically cache the return values of a function.

```typescript
import { memoize } from "@wpackages/cache";

const expensiveCalculation = (x: number, y: number) => {
	console.log("Performing calculation...");
	return x + y;
};

const memoizedCalc = memoize(expensiveCalculation, { maxSize: 10 });

memoizedCalc(2, 3); // "Performing calculation..." is logged
memoizedCalc(2, 3); // The result is returned from cache; no log
```

## License

This project is licensed under the MIT License.
