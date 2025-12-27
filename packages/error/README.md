# error

> Type-safe error handling with Result<T, E>

Functional error handling library using `Result<T, E>` pattern (like Rust).

## Features

- ✅ **Type-safe** - Full TypeScript support with discriminated unions
- ✅ **Functional** - Pure functions, no classes or throwing
- ✅ **Result<T, E>** - Rust-style error handling
- ✅ **Rich Errors** - Structured error types with metadata
- ✅ **Zero Dependencies** - Only depends on program

## Installation

```sh
bun add error
```

## Quick Start

### Basic Usage

```typescript
import { notFoundError, validationError } from 'error';
import { ok, err } from 'program';
import type { Result } from 'program';

// Validation
function validateEmail(email: string): Result<string, ValidationError> {
  if (!email.includes('@')) {
    return err(validationError('Invalid email format', { 
      field: 'email',
      value: email 
    }));
  }
  return ok(email);
}

// Usage
const result = validateEmail('not-an-email');
if (!result.ok) {
  console.log('Error:', result.error.message);
  console.log('Field:', result.error.field);
}
```

### Finding Resources

```typescript
import { notFoundError } from 'error';
import { ok, err } from 'program';

async function findUser(id: number): Promise<Result<User, NotFoundError>> {
  const user = await db.users.findById(id);
  
  if (!user) {
    return err(notFoundError('User', id));
  }
  
  return ok(user);
}

// Usage
const result = await findUser(999);
if (!result.ok) {
  console.log(result.error.message); // "User with id "999" not found"
}
```

### HTTP Errors

```typescript
import { httpError } from 'error';
import { Try } from 'program';

async function fetchData(url: string): Promise<Result<Data, HttpError>> {
  const result = await Try(async () => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  });

  if (!result.ok) {
    return err(httpError('Failed to fetch', 500, { 
      url,
      cause: result.error 
    }));
  }

  return ok(result.value);
}
```

## API

### Error Creators

All error creators are **pure functions** that return error objects.

```typescript
// Basic errors
appError(message, options?)
validationError(message, options?)
httpError(message, status, options?)
notFoundError(resource, id?, options?)

// Auth errors
unauthorizedError(message, options?)
forbiddenError(message, options?)

// Other errors
conflictError(message, options?)
timeoutError(message, timeout, options?)
networkError(message, options?)
databaseError(message, options?)

// Conversion
fromError(error: Error)
fromUnknown(error: unknown)
```

### Error Types

```typescript
interface ValidationError {
  name: "ValidationError";
  message: string;
  field?: string;
  value?: unknown;
  code?: string;
  metadata?: Record<string, unknown>;
  cause?: Error;
}

interface NotFoundError {
  name: "NotFoundError";
  message: string;
  resource: string;
  id?: string | number;
  code?: string;
  metadata?: Record<string, unknown>;
  cause?: Error;
}

// ... และอื่นๆ
```

## Examples

### Chaining Results

```typescript
import { findUser, validateEmail } from './services';

async function processUser(id: number) {
  const userResult = await findUser(id);
  if (!userResult.ok) return userResult;

  const user = userResult.value;
  const emailResult = validateEmail(user.email);
  if (!emailResult.ok) return emailResult;

  return ok(emailResult.value);
}
```

### Error Context

```typescript
import { databaseError } from 'error';

async function queryDB(sql: string) {
  try {
    return ok(await db.query(sql));
  } catch (error) {
    return err(databaseError('Query failed', {
      query: sql,
      table: 'users',
      cause: error as Error,
      metadata: { timestamp: Date.now() },
    }));
  }
}
```
