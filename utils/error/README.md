# @wpackages/error

This package provides robust and type-safe error handling utilities for TypeScript applications, built on top of the `effect` library.

## Installation

```bash
bun add @wpackages/error effect
```

## Core Concepts

### `AppError`

A custom, tagged error class for application-specific errors. It extends `Data.TaggedError` from `effect` to allow for easy pattern matching.

```typescript
import { AppError } from '@wpackages/error';

const error = new AppError({ message: 'User not found', statusCode: 404 });
```

### `tryPromise`

A utility to safely create an `Effect` from a function that might throw an error (synchronous or asynchronous). It automatically catches exceptions and converts them into an `AppError`.

```typescript
import { tryPromise } from '@wpackages/error';
import { Effect } from 'effect';

// For a function that resolves
const successfulEffect = tryPromise(() => Promise.resolve('Success!'));

// For a function that throws
const failedEffect = tryPromise(() => {
  throw new Error('Something went wrong!');
}, 400);

// Running the effect
Effect.runPromise(successfulEffect).then(console.log); // Output: Success!
```

### `mapError`

Maps the error channel of an `Effect` to a new `AppError`.

```typescript
import { mapError, AppError } from '@wpackages/error';
import { Effect } from 'effect';

const originalEffect = Effect.fail(new Error('Original error'));

const mappedEffect = mapError(
  originalEffect,
  (e) => new AppError({ message: `Mapped: ${e.message}`, statusCode: 500 })
);
```

### `fromEither`

Converts an `Either` from `effect` into an `Effect`, mapping the `Left` side to an `AppError`.

```typescript
import { fromEither } from '@wpackages/error';
import { Either } from 'effect';

const right = Either.right('Success');
const effectFromRight = fromEither(right); // Succeeds with 'Success'

const left = Either.left('Failure');
const effectFromLeft = fromEither(left, 404); // Fails with an AppError
```
