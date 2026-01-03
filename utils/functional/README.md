# @wpackages/functional

## Introduction

`@wpackages/functional` is a core utility library that provides a set of foundational tools and patterns for building applications using functional programming principles in TypeScript. It is built entirely on top of the `Effect-TS` library, offering a robust framework for managing side effects, handling errors, and composing application logic in a type-safe and declarative way.

## Features

-   ⚡ **Effect-Based**: Everything is built around the `Effect` data type, providing a powerful abstraction for managing asynchronous operations and side effects.
-   🏷️ **Tagged Errors**: A system for creating custom, tagged errors that enables exhaustive, type-safe error handling with `Effect.catchTag`.
-   🧩 **Service-Oriented**: Promotes a service-oriented architecture where dependencies (like logging) are managed as services within the `Effect` context.
-   🧱 **Composable Components**: A model for creating components (e.g., UI components) whose interactions are described as `Effect`s.

## Goal

-   🎯 **Foundation for FP**: To provide the foundational patterns and utilities for building all applications in the monorepo in a consistent, functional style.
-   🛡️ **Increase Robustness**: To build applications that are more robust, testable, and easier to reason about by making side effects explicit.
-   🧑‍💻 **Standardize Patterns**: To establish a standard set of patterns for error handling, dependency management, and application composition.

## Design Principles

-   **Purity**: Business logic should be written as pure functions where possible.
-   **Explicit Side Effects**: All side effects (e.g., logging, network requests) must be wrapped in an `Effect`.
-   **Dependency Injection**: Services are provided to the application via `Effect`'s context management system (Layers), promoting loose coupling and testability.

## Installation

This is a workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

The library provides building blocks for creating functional applications.

### Example: Composing an Application

This example demonstrates how to compose different parts of an application (services, components, utils) using `Effect.gen`.

```typescript
import { Effect } from "effect";
import { Button } from "./components"; // A component with an Effect-based onClick handler
import { log } from "./services";     // A logging service that returns an Effect
import { capitalize } from "./utils";    // A pure utility function

const myApp = Effect.gen(function*() {
	const capitalizedLabel = capitalize("click me");

	// The onClick handler is an Effect, not a function with side effects.
	const button = Button({
		label: capitalizedLabel,
		onClick: log("Button was clicked!"),
	});

	yield* log("Application has started");
	yield* log(`Rendering button: ${JSON.stringify(button)}`);
});

// To run the application, you would provide the necessary services (like a logger)
// and then execute the effect.
// Effect.runPromise(myApp);
```

## License

This project is licensed under the MIT License.
