# resilience

Resilience patterns and fault tolerance utilities built with functional programming and Effect-TS.

## Installation

```bash
bun add resilience
```

## Features

- 🚀 **Type-safe API** with full TypeScript support
- 🧩 **Functional programming** approach using Effect-TS
- 📦 **Zero dependencies** except Effect-TS
- ✅ **Fully tested** with comprehensive test coverage
- 🔄 **Multiple resilience patterns** in one package
- 🎯 **Composable** and reusable components

## Resilience Patterns

### 🔁 Retry
Automatic retry with configurable strategies:

```typescript
import { retry, createRetryPolicy } from 'resilience';

const retryPolicy = createRetryPolicy({
  maxRetries: 3,
  retryDelay: 1000,
  exponentialBackoff: true,
});

const result = await retry(
  async () => fetch('/api/data'),
  retryPolicy
);
```

### ⏱️ Timeout
Add timeout protection to operations:

```typescript
import { withTimeout, createTimeoutConfig } from 'resilience';

const timeoutConfig = createTimeoutConfig({
  duration: 5000,
  onTimeout: () => console.log('Operation timed out'),
});

const result = await withTimeout(
  async () => fetch('/api/slow-endpoint'),
  timeoutConfig
);
```

### ⚡ Circuit Breaker
Prevent cascading failures:

```typescript
import { createCircuitBreaker, createCircuitBreakerConfig } from 'resilience';

const circuitBreaker = createCircuitBreaker(
  createCircuitBreakerConfig({
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 60000,
  })
);

const result = await circuitBreaker.execute(
  async () => fetch('/api/unstable-service')
);
```

### 🛡️ Bulkhead
Limit concurrent executions:

```typescript
import { createBulkhead, createBulkheadConfig } from 'resilience';

const bulkhead = createBulkhead(
  createBulkheadConfig({
    maxConcurrent: 10,
    maxQueue: 50,
  })
);

const result = await bulkhead.execute(
  async () => processHeavyWorkload()
);
```

### 🚦 Rate Limiter
Control request frequency:

```typescript
import { createRateLimiter } from 'resilience';

const rateLimiter = createRateLimiter({
  algorithm: 'token-bucket',
  capacity: 100,
  refillRate: 10,
});

const result = await rateLimiter.check('user-123');
if (result.allowed) {
  await processRequest();
}
```

### 🔄 Fallback
Provide alternative values or functions:

```typescript
import { fallback, createFallbackConfig } from 'resilience';

const result = await fallback(
  async () => fetch('/api/primary-service'),
  createFallbackConfig({
    fallbackValue: { status: 'offline' },
    shouldFallback: (error) => error.status === 503,
  })
);
```

### 💊 Health Check
Monitor system health:

```typescript
import { createHealthMonitor, createAPIHealthCheck } from 'resilience';

const healthMonitor = createHealthMonitor({
  checks: [
    createAPIHealthCheck('main-api', 'https://api.example.com/health'),
    createDatabaseHealthCheck('database', checkDatabaseConnection),
  ],
  interval: 30000,
});

healthMonitor.start();
const health = await healthMonitor.getHealth();
```

## Composition

Combine multiple patterns for comprehensive resilience:

```typescript
import { 
  createResilientFunction,
  withTimeout,
  withRetry,
  withCircuitBreaker,
  withBulkhead
} from 'resilience';

const resilientApiCall = createResilientFunction(
  async (url: string) => fetch(url),
  {
    timeout: 5000,
    retryAttempts: 3,
    circuitBreakerThreshold: 5,
    bulkheadLimit: 10,
  }
);

const result = await resilientApiCall('/api/data');
```

## Effect-TS Integration

Full Effect-TS support for functional programming:

```typescript
import { Effect } from 'effect';
import { timeoutEffect, retryEffect, circuitBreakerEffect } from 'resilience';

const program = Effect.tryPromise(() => fetch('/api/data'))
  .pipe(
    timeoutEffect(5000),
    retryEffect(3),
    circuitBreakerEffect(5)
  );

const result = await Effect.runPromise(program);
```

## API Reference

### Core Types

- `ResilienceConfig<T>` - Configuration for resilience patterns
- `ResilienceResult<T>` - Result wrapper with metadata
- `ResilienceFunction<T, A>` - Function type for resilient operations

### Services

- **Rate Limiter**: `createRateLimiter`, `rateLimitEffect`
- **Retry**: `retry`, `retryEffect`, `createRetryPolicy`
- **Bulkhead**: `createBulkhead`, `bulkheadEffect`
- **Circuit Breaker**: `createCircuitBreaker`, `circuitBreakerEffect`
- **Fallback**: `fallback`, `fallbackEffect`, `withFallback`
- **Health Check**: `createHealthMonitor`, `runHealthCheck`
- **Timeout**: `withTimeout`, `timeoutEffect`, `createTimeoutConfig`

### Components

- `withTimeout` - Add timeout to any function
- `withRetry` - Add retry logic with exponential backoff
- `withCircuitBreaker` - Add circuit breaker protection
- `withBulkhead` - Limit concurrent executions
- `withRateLimit` - Control execution frequency
- `withFallback` - Provide fallback logic

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Build
bun run build

# Review (format, lint, test, build)
bun run review

# Test coverage
bun run test:coverage
```

## Contributing

Contributions are welcome! Please read our contributing guidelines.

### Development Setup

1. Clone the repository
2. Install dependencies with `bun install`
3. Make your changes
4. Run `bun run review` to ensure quality
5. Submit a pull request

## License

MIT © Wrikka Team

## Related Packages

- `functional` - Functional programming utilities
- `effect` - Effect-TS extensions
- `testing` - Testing utilities
