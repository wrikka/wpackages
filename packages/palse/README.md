# @wpackages/palse

## Introduction

`@wpackages/palse` is an experimental, functional, and type-safe reactive core for building user interfaces and managing state. Inspired by the elegant reactivity model of Vue.js, it re-imagines signals, computed properties, and effects within the functional programming paradigm of `Effect-TS`. It provides a powerful, composable, and predictable way to handle dynamic state.

## Features

- 💡 **Signals**: Create fine-grained, reactive state primitives that can be read from and written to.
- 🧮 **Computed**: Define values that are derived reactively from other signals or computed properties.
- ⚡ **Effects**: Run side effects (like rendering, logging, or data fetching) that automatically re-execute when their dependencies change.
- 🧩 **Functional & Composable**: Built entirely on top of `Effect-TS`, allowing you to seamlessly integrate reactive state with other functional constructs like services and layers.
- 🔒 **Type-Safe**: Guarantees compile-time safety for all reactive relationships and state transitions.

## Goal

- 🎯 **Modern Reactivity**: To explore a new model for frontend reactivity that is both highly performant and rigorously type-safe.
- 💪 **Robust State Management**: To provide a lightweight yet powerful alternative to existing state management libraries.
- 🧩 **High Composability**: To create a system that integrates flawlessly within the broader `Effect-TS` ecosystem.

## Design Principles

- **Functional Core**: The entire reactivity system is implemented using pure functions and the `Effect` data type.
- **Explicit Dependencies**: The dependency graph is tracked automatically but remains explicit, avoiding magic and making debugging easier.
- **Fine-Grained Updates**: Only the parts of your application that depend on a changed signal are re-evaluated, ensuring optimal performance.
- **Predictable Execution**: The flow of data and effects is unidirectional and easy to reason about.

## Installation

This is a workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

The core primitives of `palse` are `signal`, `computed`, and `effect`.

### Example

```typescript
import { computed, effect, signal } from "@wpackages/palse";
import { Effect } from "effect";

const program = Effect.gen(function*() {
	// 1. Create a reactive signal
	const count = yield* signal(0);

	// 2. Create a computed value derived from the signal
	const double = yield* computed(() => count.get() * 2);

	// 3. Create an effect that runs whenever a dependency changes
	yield* effect(() => {
		console.log(`Count is ${count.get()}, double is ${double.get()}`);
	});

	// 4. Update the signal's value, which will trigger the effect
	yield* count.set(5);
	// Console output: Count is 5, double is 10

	yield* count.set(10);
	// Console output: Count is 10, double is 20
});

// To run this, you would use an Effect runtime.
// Effect.runPromise(program);
```

## License

This project is licensed under the MIT License.
