# @wpackages/resilience

An Effect-TS native library for building resilient applications with functional programming.

## Installation

```bash
bun add @wpackages/resilience
```

## Features

- 🚀 **Type-safe and purely functional API** built on Effect-TS
- 🧩 **Composable resilience patterns** (Retry, Timeout, Circuit Breaker, etc.)
- 📦 **Zero dependencies** except for Effect-TS
- ✅ **Fully tested** with comprehensive test coverage

## Usage

The primary way to use this library is through the `run` function, which takes an operation (a function returning a Promise) and a configuration object.

```typescript
import { run } from "@wpackages/resilience";

const myApiCall = () => fetch("/api/data");

const result = await run(myApiCall, {
	retryAttempts: 3,
	timeout: 5000,
});

if (result.success) {
	console.log("Data:", result.data);
} else {
	console.error("Error:", result.error);
}
```

## Advanced Usage with Effect-TS

If you are already working within an Effect context, you can use `createResilientEffect` to apply resilience patterns directly to your effects.

```typescript
import { createResilientEffect } from "@wpackages/resilience";
import { Effect } from "effect";

const myEffect = Effect.tryPromise({
	try: () => fetch("/api/data"),
	catch: (error) => new Error(String(error)),
});

const resilientEffect = createResilientEffect(myEffect, {
	retryAttempts: 3,
	timeout: 5000,
});

const result = await Effect.runPromise(resilientEffect);
```

## API Reference

### Core Functions

- `run(operation, config)`: Executes a promise-returning function with resilience patterns.
- `createResilientEffect(effect, config)`: Applies resilience patterns to an existing `Effect`.

### Core Types

- `ResilienceConfig`: Configuration object for all resilience patterns.
- `ResilienceResult<T>`: The result of a resilient operation.

### Resilience Effects

These functions can be used individually for more granular control.

- `retryEffect(effect, config)`
- `timeoutEffect(effect, duration)`
- `circuitBreakerEffect(config)(effect)`

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
```

## Contributing

Contributions are welcome! Please read our contributing guidelines.

## License

MIT © Wrikka Team
