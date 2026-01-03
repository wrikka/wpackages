# @wpackages/resilience

## Introduction

`@wpackages/resilience` is an `Effect-TS` native library for building fault-tolerant and resilient applications. It provides a collection of composable, functional utilities for implementing common resilience patterns such as retries, timeouts, and circuit breakers, allowing you to make your application more robust in the face of transient failures.

## Features

- 💪 **Common Resilience Patterns**: Includes implementations for Retry, Timeout, and Circuit Breaker.
- 🧩 **Fully Composable**: Resilience policies are applied as functions that wrap your `Effect`s, allowing them to be easily composed and reused.
- 🚀 **`Effect-TS` Native**: Built entirely on top of `Effect-TS` for a purely functional, type-safe, and declarative API.
- 📦 **Zero Dependencies**: The only dependency is `effect` itself.

## Goal

- 🎯 **Increase Application Stability**: To make it easy to build applications that can gracefully handle and recover from transient errors.
- 🧑‍💻 **Declarative Policies**: To allow developers to declaratively define resilience policies rather than writing complex, imperative error-handling logic.
- 🧩 **Maintain Composability**: To ensure that adding resilience does not break the composability and purity of a functional codebase.

## Design Principles

- **Functional**: All patterns are implemented as higher-order functions that take an `Effect` and return a new, more resilient `Effect`.
- **Type-Safe**: Leverages `Effect-TS`'s powerful type system to ensure all operations are type-safe.
- **Layered**: Resilience patterns can be layered on top of each other to create sophisticated fault-tolerance strategies.

## Installation

This is a workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

The library provides helpers for applying resilience patterns directly to `Effect`s.

### Example: Applying Retry and Timeout to an Effect

```typescript
import { createResilientEffect } from "@wpackages/resilience";
import { Effect } from "effect";

// An effect that might fail or take too long
const myApiCallEffect = Effect.tryPromise({
	try: () => fetch("/api/unreliable-data"),
	catch: (error) => new Error(String(error)),
});

// Create a new, more resilient effect by wrapping the original
const resilientEffect = createResilientEffect(myApiCallEffect, {
	retry: {
		attempts: 3,
		delay: "100 millis",
	},
	timeout: {
		duration: "5 seconds",
	},
});

// Run the resilient effect
const result = await Effect.runPromise(resilientEffect);
```

## License

This project is licensed under the MIT License.
