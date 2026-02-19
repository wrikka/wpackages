# @wpackages/error

> Type-safe error handling utilities and custom error types for TypeScript applications

A comprehensive error handling library built with Effect-TS. Provides structured error types, error transformation utilities, and seamless integration with Zod validation.

## ✨ Features

- 🏷️ **Tagged Errors**: Type-safe error discrimination using Effect-TS Data.TaggedError
- 📋 **Standard Error Types**: Pre-built error classes for common HTTP scenarios
- 🔄 **Error Transformation**: Convert Zod errors, Promise rejections, and Either types
- 🎯 **Pattern Matching**: Robust error handling with type-safe pattern matching
- 📊 **HTTP Status Codes**: Built-in status codes for API error responses
- 🧩 **Composable**: Works seamlessly with Effect-TS ecosystem

## 🎯 Goal

- 🛡️ Provide consistent error handling across applications
- 🔒 Ensure type safety in error handling flows
- 🎯 Enable robust pattern matching on error types
- 📚 Reduce boilerplate for common error scenarios

## 🏗️ Architecture

### Key Concepts

- **Tagged Errors**: Errors are tagged using Effect-TS for type-safe discrimination
- **Operational Errors**: Distinguish between operational and programming errors
- **Error Chaining**: Support for error causes to maintain error context

## 📦 Installation

```bash
bun add @wpackages/error
```

## 🚀 Usage

### Basic Error Types

```typescript
import { AppError, ValidationError, NotFoundError } from "@wpackages/error";

// Create an application error
const error = new AppError({
  message: "Something went wrong",
  statusCode: 500,
  isOperational: true,
});

// Validation error (400)
const validationError = new ValidationError({
  message: "Invalid input data",
  statusCode: 400,
});

// Not found error (404)
const notFoundError = new NotFoundError({
  message: "User not found",
  statusCode: 404,
});
```

### Available Error Types

```typescript
import {
  AppError,           // Generic application error
  ValidationError,    // 400 Bad Request
  AuthenticationError, // 401 Unauthorized
  AuthorizationError,  // 403 Forbidden
  NotFoundError,      // 404 Not Found
  ConflictError,      // 409 Conflict
} from "@wpackages/error";
```

### Error from Zod Validation

```typescript
import { z } from "zod";
import { fromZodError } from "@wpackages/error";

const schema = z.object({
  name: z.string(),
  age: z.number().min(0),
});

const result = schema.safeParse({ name: 123, age: -5 });

if (!result.success) {
  const error = fromZodError(result.error);
  // ValidationError: "Validation failed: name - Expected string, received number, age - Number must be greater than or equal to 0"
}
```

### Error from Promise

```typescript
import { tryPromise } from "@wpackages/error";
import { Effect } from "effect";

// Wrap a promise to get an AppError on rejection
const program = tryPromise(
  () => fetch("/api/users").then((r) => r.json()),
  (error) => new AppError({ message: "API request failed", cause: error })
);

// Handle with Effect
Effect.runPromise(
  program.pipe(
    Effect.catch((error) => {
      console.error(error.message);
      return Effect.succeed(null);
    })
  )
);
```

### Error from Either

```typescript
import { fromEither } from "@wpackages/error";
import { Either } from "effect";

const either: Either.Either<string, Error> = Either.left(new Error("Failed"));

// Convert to AppError
const error = fromEither(either, (e) => new AppError({ message: e.message }));
```

### Pattern Matching with Effect

```typescript
import { Effect } from "effect";
import { AppError, ValidationError, NotFoundError } from "@wpackages/error";

const program = Effect.gen(function* (_) {
  // Some operation that might fail
  const result = yield* _(Effect.try({
    try: () => JSON.parse('{"name": "test"}'),
    catch: (e) => new ValidationError({ message: "Invalid JSON", cause: e }),
  }));
  return result;
});

// Handle specific error types
const handled = program.pipe(
  Effect.catchTags({
    ValidationError: (error) => {
      console.log(`Validation: ${error.message}`);
      return Effect.succeed({ fallback: true });
    },
    NotFoundError: (error) => {
      console.log(`Not Found: ${error.message}`);
      return Effect.succeed({ fallback: true });
    },
    AppError: (error) => {
      console.log(`App Error: ${error.message}`);
      return Effect.succeed({ fallback: true });
    },
  })
);
```

## 📚 API Reference

### Error Types

| Error Class | Default Status | Description |
|-------------|----------------|-------------|
| `AppError` | 500 | Generic application error |
| `ValidationError` | 400 | Input validation failure |
| `AuthenticationError` | 401 | Authentication required |
| `AuthorizationError` | 403 | Permission denied |
| `NotFoundError` | 404 | Resource not found |
| `ConflictError` | 409 | Resource conflict |

### Error Properties

| Property | Type | Description |
|----------|------|-------------|
| `message` | `string` | Human-readable error message |
| `statusCode` | `number` | HTTP status code |
| `isOperational` | `boolean` | Is this an operational error? |
| `cause` | `unknown` | Original error cause |

### Utility Functions

| Function | Description |
|----------|-------------|
| `fromZodError(zodError, options?)` | Convert ZodError to ValidationError |
| `fromEither(either, mapError)` | Convert Either to AppError |
| `tryPromise(promise, mapError)` | Wrap Promise with error mapping |

## 🛠️ Development

```bash
# Install dependencies
bun install

# Run tests
bun run test

# Build
bun run build

# Lint
bun run lint

# Format
bun run format

# Watch mode
bun run watch
```

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `dev` | Run development mode |
| `build` | Build with tsdown |
| `test` | Run tests with Vitest |
| `lint` | Type check and lint |
| `format` | Format with dprint |
| `watch` | Watch mode for development |

## 📄 License

MIT
