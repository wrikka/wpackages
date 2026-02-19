# Effect Library

## Introduction

The Effect Library is a production-ready effect system for Rust that provides **ergonomic** abstractions for managing side effects in a functional programming style. Inspired by Effect TS and designed for production use, it enables developers to write clean, composable code with explicit effect handling, making it easier to reason about asynchronous operations, error handling, and resource management.

Unlike other effect libraries in the Rust ecosystem that focus on educational purposes or require nightly compilers, the Effect Library is built for production use with stable Rust. It offers comprehensive resilience patterns including Retry, Circuit Breaker, Rate Limiting, and Throttle out of the box, making it ideal for building robust, maintainable applications with complex async workflows while maintaining the benefits of functional programming.

The library seamlessly integrates with the Tokio ecosystem, providing async utilities like Stream processing, Scheduling, and Queue management.

## Execution Model

An `Effect<T, E, R>` is a description of a computation that:

- Produces a value of type `T` on success
- Produces a value of type `E` on failure
- Requires an environment/context of type `R`

At runtime, an `Effect` is executed by calling `run` with its required context.

## Performance Notes

This project aims for minimal overhead and a clean, composable API.

**Current Implementation Characteristics:**
- `Effect` is backed by a callable stored behind an `Arc` and returns a boxed `Future`
- This provides ergonomic composition and cloning at the cost of:
  - **Dynamic dispatch** via `dyn Fn` vtable lookups
  - **Heap allocations** for both the stored function and returned futures

**Performance Trade-offs:**
- ✅ Excellent ergonomics and composability
- ✅ Easy cloning and sharing of effects
- ✅ Lock-free execution (no internal mutex)
- ⚠️ Not zero-cost - each effect has allocation overhead from boxing

For applications where **raw performance** is critical over ergonomics, consider using raw async functions or libraries like [`stellar-effects`](https://github.com/qsantos/stellar-effects) that use GADT-based approaches.

## Features

- 🚀 **Ergonomic Abstractions** - Effects are described as functions with composable interface
- 🔗 **Composable** - Chain operations with `map`, `flatMap`, `bind` for clean code
- 🎯 **Context-Aware** - Dependency injection through typed contexts
- ⚡ **Async Support** - Both sync and async effects with Tokio integration
- 🔒 **Type-Safe** - Compile-time guarantees for effects
- 🎨 **Functional Types** - Option and Either types for functional programming
- 🛡️ **Resilience** - Retry, Circuit Breaker, Rate Limiting, Throttle out of the box
- 📊 **Metrics** - Track performance and execution metrics
- 🔍 **Tracing** - Distributed tracing for debugging
- 🎭 **Mocking** - Test utilities for mocking effects
- 🏗️ **Builders** - Fluent builder pattern for constructing effects
- 🔧 **Composition** - Advanced composition helpers
- ⚡ **Performance** - Performance monitoring and optimization
- 🌐 **Ecosystem** - Effect patterns and integrations
- 📝 **Structured Errors** - Type-safe error handling
- 🔄 **Error Recovery** - Comprehensive error recovery strategies

## Goals

- **Provide ergonomic effect abstractions for Rust**
- **Aim for reasonable performance while prioritizing ergonomics**
- **Enable composable, functional-style programming**
- **Support both sync and async operations**
- **Implement resilience patterns out of the box**
- **Ensure type safety and compile-time guarantees**
- **Provide clean, intuitive API design**
- **Enable comprehensive error handling**
- **Seamless integration with tokio ecosystem**
- **Enable modular and reusable effects**
- **Provide production-ready, stable API**
- **Offer comprehensive observability tools**
- **Enable comprehensive testing utilities**

## Design Principles

- **Performance Balance** - Ergonomic abstractions with acceptable overhead for most use cases
- **Composability** - Chain operations naturally with clean API
- **Type Safety** - Leverage Rust's type system for compile-time guarantees
- **Async-First** - Support both sync and async with Tokio integration
- **Simplicity** - Clean, intuitive API design
- **Resilience** - Built-in error handling and resilience patterns
- **Observability** - Track effect execution with comprehensive tools
- **Modularity** - Independent and reusable components
- **Safety** - Memory and type safety guarantees
- **Integration** - Works seamlessly with Tokio ecosystem
- **Production-Ready** - Stable API, no nightly compiler required

## Installation

<details>
<summary>As a Rust Dependency (Local Path)</summary>

Add this to your `Cargo.toml`:

```toml
[dependencies]
effect = { path = "../effect" }
```

## Comparison with Effect TS

| Concept | Effect TS | This crate |
|---|---|---|
| Effect type | `Effect<A, E, R>` | `Effect<T, E, R>` |
| Run (simple) | `Effect.runPromise(...)` | `effect.run(()).await` |
| Run (with DI) | runtime + Layer | `Runtime::run(effect).await` |
| Environment | `R` (Context/Layer) | `R` and `Context` (typed service container) |
| Error channel | `E` | `E` (often `EffectError`) |
| Composition | `map/flatMap` | `map/flat_map` |

The core idea is the same: keep side effects explicit, compose them, and run them with a provided environment.

**Two ways to run effects:**
- `effect.run(())` - For simple effects without services
- `runtime.run(effect)` - For effects with dependency injection via Context

</details>

<details>
<summary>From crates.io (Coming Soon)</summary>

```toml
[dependencies]
effect = "0.1.0"
```

</details>

## Usage

### Basic Example

```rust
use effect::{Effect, Runtime};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let runtime = Runtime::new();

    let effect = Effect::success(42)
        .map(|x| x * 2)
        .flat_map(|x| Effect::success(x + 10));

    let result = runtime.run(effect).await?;
    println!("Result: {}", result);

    Ok(())
}
```

### Effect Logging

```rust
use effect::{Effect, Runtime};
use effect::services::logging::{LogLevel, Logging};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // In a real app, initialize the subscriber once.
    effect::telemetry::init_subscriber();

    let effect = Effect::success(42)
        .map(|x| x * 2)
        .with_logging(LogLevel::Info);

    let result = effect.run(()).await?;
    println!("Result: {}", result);

    Ok(())
}
```

### Effect Metrics

```rust
use effect::{Effect, Runtime};
use effect::services::metrics::Metrics;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // In a real app, initialize a recorder once.
    // This requires the `metrics-prometheus` feature.
    #[cfg(feature = "metrics-prometheus")]
    effect::telemetry::init_prometheus_recorder();

    let effect = Effect::success(42)
        .with_metrics("my_effect");

    let result = effect.run(()).await?;

    Ok(())
}
```

### Effect Tracing

```rust
use effect::{Effect, Runtime};
use effect::services::tracing::Tracing;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // In a real app, initialize the subscriber once.
    effect::telemetry::init_subscriber();

    let effect = Effect::success(42)
        .with_tracing("my_effect");

    let result = effect.run(()).await?;

    Ok(())
}
```

### Effect Mocking

```rust
use effect::prelude::*;
use effect::services::mocking::Mock;
use effect::services::assertions::EffectAssertions;

#[tokio::test]
async fn test_effect() {
    let mock = Mock::success(42);
    let effect = Effect::from(mock.clone());

    effect.should_succeed_with(42).await;
    mock.verify_called();
}
```

### Structured Error Context

```rust
use effect::prelude::*;
use effect::error::EffectError;
use effect::services::error_context::ErrorContextExt;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let user_id = "user-123";

    let effect: Effect<i32, _, _> = Effect::failure(
        std::io::Error::new(std::io::ErrorKind::Other, "Connection failed")
    )
    .with_context("Failed to fetch user data")
    .with_context_kv("user_id", user_id);

    let result = effect.run(()).await;

    if let Err(e) = result {
        println!("{}", e);
    }

    Ok(())
}
```

### Error Recovery Strategies

```rust
use effect::{Effect, Runtime};
use effect::services::error_recovery::ErrorRecovery;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let runtime = Runtime::new();

    let effect = Effect::fail(MyError::ConnectionError("...".to_string()))
        .recover_with(|error| {
            match error {
                MyError::ConnectionError(_) => 42,
                _ => 0,
            }
        });

    let result = runtime.run(effect).await?;

    Ok(())
}
```

### Structured Error Types

```rust
use effect::{Effect, Runtime};
use effect::services::structured_errors::StructuredErrorExt;

#[derive(Debug)]
enum MyError {
    NotFound { id: i32 },
    ConnectionError(String),
}

impl StructuredError for MyError {
    fn error_code(&self) -> &'static str {
        match self {
            MyError::NotFound { .. } => "NOT_FOUND",
            MyError::ConnectionError(_) => "CONNECTION_ERROR",
        }
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let runtime = Runtime::new();

    let effect = Effect::fail(MyError::NotFound { id: 123 })
        .with_error_code();

    let result = runtime.run(effect, ()).await;

    Ok(())
}
```

### Effect Builders

```rust
use effect::{Effect, Runtime};
use effect::services::builders::EffectBuilder;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let runtime = Runtime::new();

    let effect = EffectBuilder::new()
        .with_retry(3, std::time::Duration::from_millis(100))
        .with_circuit_breaker(5, std::time::Duration::from_secs(60))
        .with_logging(effect::services::logging::LogLevel::Info)
        .build(|| Effect::success(42));

    let result = runtime.run(effect).await?;
    println!("Result: {}", result);

    Ok(())
}
```

### Effect Composition

```rust
use effect::{Effect, Runtime};
use effect::services::composition::compose_effects;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let runtime = Runtime::new();

    let effect1 = Effect::success(10);
    let effect2 = Effect::success(20);
    let effect3 = Effect::success(30);

    let composed = compose_effects!(
        effect1,
        effect2,
        effect3
    );

    let result = runtime.run(composed).await?;

    Ok(())
}
```

### Performance Monitoring

```rust
use effect::{Effect, Runtime};
use effect::services::performance::PerformanceMonitoring;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let runtime = Runtime::new();

    let effect = Effect::success(42)
        .with_performance_monitoring();

    let result = runtime.run(effect).await?;

    Ok(())
}
```

### Effect Ecosystem

```rust
use effect::{Effect, Runtime};
use effect::services::ecosystem::{EffectEcosystem, EffectPattern};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let runtime = Runtime::new();

    let ecosystem = EffectEcosystem::new()
        .register_pattern(EffectPattern::RetryWithBackoff)
        .register_pattern(EffectPattern::CircuitBreaker);

    let effect = ecosystem.apply_pattern(
        EffectPattern::RetryWithBackoff,
        Effect::success(42)
    );

    let result = runtime.run(effect).await?;

    Ok(())
}
```

## Examples

### Example 1: Basic Effect Chaining

```rust
use effect::{Effect, Runtime};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let runtime = Runtime::new();

    let effect = Effect::success(42)
        .map(|x| x * 2)
        .flat_map(|x| Effect::success(x + 10));

    let result = runtime.run(effect).await?;
    println!("Result: {}", result);

    Ok(())
}
```

### Example 5: Retry with Logging

```rust
use effect::{Effect, Runtime};
use effect::services::logging::LogLevel;
use std::time::Duration;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let runtime = Runtime::new();

    let mut attempts = 0;
    let effect = Effect::new(move |_| {
        attempts += 1;
        Box::pin(async move {
            if attempts < 3 {
                Err(effect::error::EffectError::new("Temporary failure"))
            } else {
                Ok("success".to_string())
            }
        })
    })
    .retry(5, Duration::from_millis(100))
    .with_logging(LogLevel::Info);

    let result = runtime.run(effect, ()).await?;
    println!("Result: {}", result);

    Ok(())
}
```

### Running Examples

From this directory:

```bash
cargo run --example basic_logging
cargo run --example retry_with_logging
cargo run --example parallel_with_logging
cargo run --example real_world
```

### Testing

```bash
cargo test
```

## Best Practices

### 1. Use Logging for Debugging

Always enable logging during development to debug effect execution:

```rust
let effect = Effect::success(42)
    .with_logging(LogLevel::Debug);
```

### 2. Use Metrics for Production

Enable metrics in production to monitor effect performance:

```rust
let effect = Effect::success(42)
    .with_metrics("my_effect");
```

### 3. Use Tracing for Distributed Systems

Use tracing for distributed systems to trace effect flows:

```rust
let effect = Effect::success(42)
    .with_tracing("my_effect");
```

### 4. Use Mocking for Testing

Use mocking to isolate dependencies in tests:

```rust
let mock = Mock::success(42);
let effect = Effect::from(mock);
```

### 5. Use Error Context for Better Error Messages

Add context to errors for better debugging:

```rust
let effect = Effect::fail(error)
    .with_context("Failed to fetch user data")
    .with_context_with(|| format!("User ID: {}", user_id));
```

### 6. Use Error Recovery for Resilience

Implement error recovery strategies for resilient applications:

```rust
let effect = Effect::fail(error)
    .recover_with(|error| fallback_value);
```

### 7. Use Structured Errors for Type Safety

Define structured error types for better error handling:

```rust
enum MyError {
    NotFound { id: i32 },
    ConnectionError(String),
}

impl StructuredError for MyError {
    fn error_code(&self) -> &'static str {
        match self {
            MyError::NotFound { .. } => "NOT_FOUND",
            MyError::ConnectionError(_) => "CONNECTION_ERROR",
        }
    }
}
```

### 8. Use Builders for Complex Effects

Use builder pattern for constructing complex effects:

```rust
let effect = EffectBuilder::new()
    .with_retry(3, Duration::from_millis(100))
    .with_circuit_breaker(5, Duration::from_secs(60))
    .with_logging(LogLevel::Info)
    .build(|| Effect::success(42));
```

### 9. Use Composition for Reusable Effects

Compose effects for reusable patterns:

```rust
let composed = compose_effects!(
    effect1,
    effect2,
    effect3
);
```

### 10. Use Performance Monitoring for Optimization

Monitor performance to optimize effect execution:

```rust
let effect = Effect::success(42)
    .with_performance_monitoring();
```

## Architecture

The Effect Library follows a modular architecture with clear separation of concerns:

```
effect/
├── src/
│   ├── types/
│   │   ├── effect.rs          # Core Effect type
│   │   ├── functional.rs       # Functional types (Option, Either)
│   │   └── context.rs          # Context management
│   ├── services/
│   │   ├── async_effects.rs    # Async operations
│   │   ├── assertions.rs       # Testing assertions
│   │   ├── builders.rs         # Builder pattern
│   │   ├── cache_effects.rs    # Caching
│   │   ├── composition.rs      # Composition helpers
│   │   ├── ecosystem.rs        # Effect patterns
│   │   ├── error_context.rs   # Error context
│   │   ├── error_recovery.rs  # Error recovery
│   │   ├── logging.rs         # Logging support
│   │   ├── metrics.rs          # Metrics collection
│   │   ├── mocking.rs          # Mocking support
│   │   ├── parallel_effects.rs # Parallel execution
│   │   ├── performance.rs      # Performance monitoring
│   │   ├── resilience_effects.rs # Resilience patterns
│   │   ├── runtime.rs          # Runtime execution
│   │   ├── structured_errors.rs # Structured error types
│   │   └── tracing.rs         # Tracing support
│   ├── error.rs               # Error types
│   └── telemetry.rs           # Telemetry integration
└── examples/
    ├── basic_logging.rs       # Basic logging example
    ├── error_context.rs       # Error context example
    ├── assertions.rs           # Testing assertions
    ├── retry_with_logging.rs  # Retry with logging
    └── parallel_with_logging.rs # Parallel with logging
```

## Documentation

- [API Documentation](https://docs.rs/effect)
- [Examples Gallery](./examples/)
- [Comparison Report](./comparison-effect-libraries.md)
- [Feature Ideas](./comparison-effect-libraries.md#13-feature-recommendations)

## License

MIT
