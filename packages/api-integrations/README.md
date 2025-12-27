# api-integrations

This package provides a collection of utilities designed to streamline the development of API integrations. It includes robust error handling, configurable retry mechanisms, caching strategies, and other helpers to build resilient and efficient API clients.

## Features

- **Effect-TS Based**: Built on top of `Effect-TS` for fully-typed, functional, and composable code.
- **Structured Error Handling**: A set of predefined, typed errors (`IntegrationError`) for common API issues like authentication, rate limiting, network problems, etc.
- **Retry Logic**: Pure, configurable functions for exponential backoff and jitter (`calculateRetryDelay`).
- **Caching Utilities**: Helpers for building, managing, and checking cache entries (`createCacheEntry`, `isCacheExpired`).
- **Request/Response Helpers**: Utilities for handling headers, query parameters, and response parsing.
- **Circuit Breaker**: A simple circuit breaker implementation to prevent repeated calls to a failing service.

## Installation

Install the package using your preferred package manager:

```bash
bun add api-integrations
```

## Usage

### Creating an Integration Config

Use `createIntegrationConfig` to safely create a configuration object from a `ConfigManager`.

```typescript
import { createIntegrationConfig } from 'api-integrations';
import { Effect } from 'effect';
import { configManager } from './config'; // Your config manager instance

const myApiConfig = createIntegrationConfig(
  configManager,
  'MY_API',
  { timeout: 15000 }
);

Effect.runPromise(myApiConfig).then(console.log);
```

### Handling Integration Errors

The package provides a set of error creation helpers and a type guard.

```typescript
import { createNetworkError, isIntegrationError } from 'api-integrations';

const myEffect = Effect.fail(createNetworkError('Service unavailable', 503));

Effect.runPromise(Effect.catchAll(myEffect, (error) => {
  if (isIntegrationError(error) && error.type === 'network') {
    console.error(`Network error with status: ${error.statusCode}`);
  }
  return Effect.succeed(null);
}));
```
