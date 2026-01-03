# @wpackages/error

## Introduction

`@wpackages/error` is a utility library that provides a robust and type-safe framework for error handling in TypeScript applications, built on top of `Effect-TS`. It offers a set of custom, tagged error classes and helper functions to make error management more predictable, declarative, and easier to reason about.

## Features

- 🏷️ **Tagged Errors**: Provides custom, tagged error classes like `AppError`, `ValidationError`, and `NotFoundError` that extend `Data.TaggedError` from `effect`.
- 🎣 **Type-Safe Catching**: Allows you to catch and handle specific error types using `Effect.catchTag`, avoiding messy `instanceof` checks.
- 래퍼 **Safe Wrappers**: Includes helper functions like `tryPromise` to safely convert functions that might throw exceptions into `Effect`s.
- ↔️ **`Either` Integration**: A `fromEither` utility to seamlessly convert an `Either` into an `Effect`, mapping the `Left` side to a custom `AppError`.
- zod **Zod Integration**: A `fromZodError` utility to seamlessly convert `ZodError` into a `ValidationError` with a user-friendly message.

## Goal

- 🎯 **Predictable Error Flow**: To eliminate the ambiguity of traditional `try/catch` blocks by making all possible failure cases explicit in the type system.
- 🛡️ **Robust Applications**: To make it easier to build applications that handle errors gracefully and correctly.
- 🧑‍💻 **Improved DX**: To provide a clear and concise API for working with errors in a functional context.

## Design Principles

- **Errors as Data**: Treats errors as first-class citizens (data) that can be passed around, inspected, and transformed.
- **Explicitness**: Makes failure paths explicit in function signatures, forcing developers to handle them.
- **Composability**: Error handling logic is composable, just like any other part of an `Effect` program.

## Installation

This is a workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

### Using Tagged Errors

Handle specific, typed errors using `Effect.catchTag`.

```typescript
import { ValidationError } from "@wpackages/error";
import { Effect } from "effect";

const validationEffect = Effect.fail(
	new ValidationError({ message: "Invalid email" }),
);

const handledEffect = validationEffect.pipe(
	Effect.catchTag(
		"ValidationError",
		(e) => Effect.succeed(`Handled validation error: ${e.message}`),
	),
);

Effect.runPromise(handledEffect).then(console.log); // Output: Handled validation error: Invalid email
```

### Safely Wrapping Throwing Functions

Use `tryPromise` to convert a function that might throw into a safe `Effect`.

```typescript
import { tryPromise } from "@wpackages/error";
import { Effect } from "effect";

const potentiallyThrowingFn = () => {
	throw new Error("Something went wrong!");
};

// The effect will fail with an AppError, preventing a crash.
const safeEffect = tryPromise(potentiallyThrowingFn, { statusCode: 500 });
```

### Integrating with Zod

Use `fromZodError` to convert validation errors from Zod into a structured `ValidationError`.

```typescript
import { fromZodError, ValidationError } from "@wpackages/error";
import { z } from "zod";

const schema = z.object({ name: z.string().min(5) });
const result = schema.safeParse({ name: "test" });

if (!result.success) {
	const error = fromZodError(result.error);
	// error is an instance of ValidationError
	// error.message => "Validation failed: name - String must contain at least 5 character(s)"
	// error.cause => ZodError(...)
}
```

## License

This project is licensed under the MIT License.
