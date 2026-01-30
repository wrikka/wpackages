# @wpackages/tui

## Introduction

`@wpackages/tui` is a functional, type-safe, and composable toolkit for building interactive command-line interfaces. It provides a unified set of high-level components for handling common CLI UI patterns, such as displaying information, prompting for user input, and showing progress. The library is built with `Effect-TS`, ensuring that all interactions are managed as declarative, testable, and robust effects.

## Features

- 🧩 **Functional and Composable**: All components are designed as `Effect`s, allowing them to be easily combined and reused.
- 🔒 **Type-Safe by Design**: Leverages `Effect` and `@effect/schema` to ensure that all component interactions are fully type-safe, from input validation to output handling.
- 🎨 **Rich Component Library**: Includes a variety of components for different UI needs:
  - **Display Components**: For rendering tables, lists, key-value pairs, and banners.
  - **Prompt Components**: A wrapper around `@clack/prompts` for interactive user input.
  - **Status Components**: For showing spinners, progress bars, and status messages.
- 💅 **Styled Output**: Uses `picocolors` for easy and consistent colored output in the terminal.

## Goal

- 🎯 **Unified API**: To provide a single, consistent API for building CLI user interfaces, abstracting away the complexities of different underlying libraries.
- 🧑‍💻 **Superior Developer Experience**: To make building complex, interactive CLIs as simple and enjoyable as building a web UI with modern components.
- ✅ **Enhanced Testability**: To enable developers to write unit and integration tests for their CLI's UI logic without having to mock terminal I/O directly.

## Design Principles

- **Declarative UI**: CLI interfaces are defined declaratively as a composition of effects, separating the UI definition from the execution logic.
- **Effect-Driven**: All I/O operations (reading input, writing to the console) are managed by the `Effect` runtime, making them interruptible, resource-safe, and easy to reason about.
- **Separation of Concerns**: The library clearly separates UI rendering logic from the application's business logic.

## Installation

This is a workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

Components from this library are imported and used within an `Effect` program. They can be combined using standard `Effect` operators like `Effect.flatMap` and `Effect.gen`.

### Example: Creating an Interactive Prompt

```typescript
import { components } from "@wpackages/tui";
import { Effect } from "effect";

// Define a program that asks for the user's name and then greets them.
const program = Effect.gen(function*() {
	const name = yield* components.prompt.text({
		message: "What is your name?",
		defaultValue: "Stranger",
	});

	yield* components.display.log(`Hello, ${name}!`);
});

// To run the program, you would use an Effect runtime.
// Effect.runPromise(program);
```

### Example: Displaying a Table

```typescript
import { components } from "@wpackages/tui";
import { Effect } from "effect";

const program = components.display.table([
	{ id: 1, name: "Product A", price: "$100" },
	{ id: 2, name: "Product B", price: "$150" },
]);

// Effect.runPromise(program);
```

## License

This project is licensed under the MIT License.
