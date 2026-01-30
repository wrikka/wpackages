# @wpackages/utils-api-integrations

## Introduction

`@wpackages/utils-api-integrations` is a utility library designed to streamline the development of robust and resilient API integrations. It provides a collection of functional, `Effect-TS`-based tools for handling common challenges like error handling, retry logic, caching, and configuration management.

## Features

- 💪 **Resilient by Design**: Built-in utilities for retries (with exponential backoff and jitter), caching, and circuit breakers.
- 🚨 **Structured Error Handling**: A set of predefined, typed errors (`IntegrationError`) for common API issues like authentication, rate limiting, and network problems.
- 🧩 **Functional and Composable**: Built entirely with `Effect-TS` for fully-typed, composable, and testable code.
- ⚙️ **Configuration Management**: Helpers for safely loading and validating API credentials and settings.
- 🧰 **Common Helpers**: Includes utilities for handling headers, query parameters, and response parsing.

## Goal

- 🎯 **Standardize Integrations**: To provide a standard, reliable toolkit for building all API integrations within the monorepo.
- 🛡️ **Increase Resilience**: To make it easy to build API clients that are resilient to common failures like network issues and rate limiting.
- 🧑‍💻 **Improve DX**: To abstract away the boilerplate associated with building robust API clients, allowing developers to focus on business logic.

## Design Principles

- **Declarative**: Policies like retries and caching are defined declaratively and composed with the core API request logic.
- **Type-Safe**: Leverages TypeScript and `Effect-TS` to ensure that all parts of an integration, from config to error handling, are type-safe.
- **Modular**: Provides a set of small, focused utilities that can be composed together as needed.

## Installation

This is a workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

The library provides helpers for various aspects of building an API client.

### Example: Structured Error Handling

Catch and handle specific, typed integration errors.

```typescript
import {
	createNetworkError,
	isIntegrationError,
} from "@wpackages/utils-api-integrations";
import { Effect } from "effect";

const apiCall = Effect.fail(
	createNetworkError({ message: "Service Unavailable", statusCode: 503 }),
);

const handledCall = Effect.catchAll(apiCall, (error) => {
	if (isIntegrationError(error) && error.type === "network") {
		console.error(`Caught a network error with status: ${error.statusCode}`);
	}
	return Effect.succeed("default-value");
});

Effect.runPromise(handledCall);
```

### Example: Retry Logic

Use helpers to calculate retry delays with exponential backoff and jitter.

```typescript
import { calculateRetryDelay } from "@wpackages/utils-api-integrations";

const firstDelay = calculateRetryDelay({ attempt: 1 }); // e.g., 100ms
const secondDelay = calculateRetryDelay({ attempt: 2 }); // e.g., 200ms + jitter

console.log(`First retry in ${firstDelay}ms, second in ${secondDelay}ms`);
```

## License

This project is licensed under the MIT License.
