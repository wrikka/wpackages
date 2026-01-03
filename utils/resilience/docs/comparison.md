# Resilience Library Comparison

This document compares `@wpackages/resilience` with other popular resilience libraries in the TypeScript ecosystem.

## Comparison Matrix

| Feature / Library         | @wpackages/resilience | Effect-TS (built-in) | cockatiel             | resily                |
| ------------------------- | --------------------- | -------------------- | --------------------- | --------------------- |
| **Primary Ecosystem**     | `Effect-TS`           | `Effect-TS`          | `Promise`             | `Promise`             |
| **API Style**             | Functional/Declarative| Functional/Operator  | Functional/Builder    | Class-based/Imperative|
| **Retry**                 | ✅ (Basic)            | ✅ (Advanced Schedule) | ✅ (Advanced Backoff) | ✅                    |
| **Timeout**               | ✅                    | ❌ (Manual)          | ✅ (Cooperative/Aggressive) | ✅                    |
| **Circuit Breaker**       | ✅                    | ❌ (Manual)          | ✅ (Advanced)         | ✅                    |
| **Fallback**              | ❌                    | ✅ (`Effect.catch*`) | ✅                    | ✅                    |
| **Bulkhead Isolation**    | ❌                    | ❌                   | ✅                    | ✅                    |
| **Caching**               | ❌                    | ❌                   | ❌                    | ✅                    |
| **Composability**         | High (Effect-native)  | High (Effect-native) | High (Policy wrapping)| Medium (Class-based)|
| **Dependencies**          | `effect` only         | `effect` core        | Zero                  | Zero                  |

## Summary

- **@wpackages/resilience**: Provides essential resilience patterns with a fully composable, `Effect-TS` native API. It's lightweight and perfectly integrated into the Effect ecosystem, but lacks some of the more advanced patterns like Bulkhead and Fallback.

- **Effect-TS (built-in)**: The core `effect` library offers powerful, low-level primitives (like `retry` with complex `Schedule`s and various `catch*` operators for fallbacks) that can be used to build any resilience pattern. However, it doesn't provide out-of-the-box, named implementations for patterns like Circuit Breaker or Timeout.

- **cockatiel**: A feature-rich and mature library for Promise-based workflows. Its functional builder pattern is expressive and highly composable. It offers more advanced configurations for retries and circuit breakers than `@wpackages/resilience`.

- **resily**: Another comprehensive Promise-based library inspired by Polly from the .NET world. Its API is more imperative and class-based. It's the only one in this comparison that offers a caching policy out of the box.

## Conclusion

For developers building applications on `Effect-TS`, `@wpackages/resilience` is the ideal choice for its seamless integration and functional API. While the core `effect` library can achieve similar results, this package provides clear, high-level abstractions for common patterns.

For Promise-based applications, `cockatiel` is a strong contender due to its rich feature set and composable, functional-style API.
