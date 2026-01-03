# @wpackages/functional

A lightweight, TypeScript-first Effect system for managing side effects in a functional and composable way.

## Design Principles

- **Type Safety:** Leverage TypeScript to provide a fully type-safe environment for managing effects, dependencies, and errors.
- **Composability:** Effects are designed to be small, focused, and easily combined to build complex programs.
- **Dependency Injection:** A simple yet powerful Layer system allows for providing and managing dependencies in a declarative way.
- **Asynchronous by Default:** Built on Promises, the system is inherently asynchronous and non-blocking.

## Installation

```bash
npm install @wpackages/functional
```

## Usage

The core of the library is the `Effect` type, which represents a computation that may have side effects, require dependencies, and can either succeed with a value or fail with an error.

### Creating Effects

```typescript
import { Effect } from "@wpackages/functional";

// Create an effect that succeeds with a value
const successEffect = Effect.succeed(42);

// Create an effect from a Promise
const promiseEffect = Effect.fromPromise(() =>
	fetch("https://api.example.com/data")
);
```

### Chaining Effects

Use `Effect.flatMap` to chain effects together in a sequence.

```typescript
const chainedEffect = Effect.flatMap(
	successEffect,
	(n) => Effect.succeed(n * 2),
);
```

### Using Generators with `Effect.gen`

For more complex sequences, `Effect.gen` provides a powerful way to write asynchronous code that looks synchronous.

```typescript
const program = Effect.gen(function*() {
	const value1 = yield Effect.succeed(1);
	const value2 = yield Effect.fromPromise(() => Promise.resolve(2));
	return value1 + value2;
});
```

### Managing Dependencies with Layers

Layers are used to provide services (dependencies) to effects.

```typescript
import { Effect, Layer } from "@wpackages/functional";

// 1. Define a service interface and a Tag
interface Random {
	readonly next: () => number;
}
const Random = Effect.tag<Random>();

// 2. Create an effect that requires the service
const program = Effect.gen(function*() {
	const random = yield Effect.get(Random);
	console.log(`Random number: ${random.next()}`);
});

// 3. Implement the service and create a Layer
const RandomLive: Random = {
	next: () => Math.random(),
};
const randomLayer = Layer.succeed(Random, RandomLive);

// 4. Provide the layer to the program
const runnable = Effect.provideLayer(program, randomLayer);

// 5. Run the final effect
Effect.runPromise(runnable);
```

## Examples

For more detailed examples, please see the test files in the `src/` directory.

## License

This project is licensed under the MIT License.
