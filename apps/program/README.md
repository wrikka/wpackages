# Program: The Ultimate Functional Programming Framework for TypeScript

A production-grade, modular functional programming framework that surpasses Effect TS in every dimension. Built with TypeScript, `program` is designed for maximum resilience, composability, and an unparalleled developer experience by leveraging the power of the WTS monorepo.

## 🚀 Core Philosophy: Modular & Composable

`program` is not a monolith. It's a cohesive ecosystem of specialized, independently versioned packages. This approach provides:

- **Maximum Tree-Shaking**: Only include the code you actually use.
- **Clear Separation of Concerns**: Each package has a single, well-defined responsibility.
- **Flexibility**: Use `program` as a unified framework or consume individual packages as needed.
- **Improved Maintainability**: Focused packages are easier to test, debug, and evolve.

## 🛠️ The WTS Ecosystem: Powering `program`

`program` integrates the best of the WTS monorepo to deliver a superior experience.

| Feature Area | Powering Package | Key Enhancements |
|---|---|---|
| **1. Core Primitives** | `@wts/functional` | `Result`, `Option`, `Async` for robust, explicit control flow. |
| **2. Error Handling** | `@wts/error` | Rich, chainable errors with metadata and type-safe error composition. |
| **3. Dependency Injection** | `@wts/dependencies` | Factory-based, lifecycle-aware, and scoped containers for ultimate flexibility. |
| **4. Concurrency** | `@wts/concurrency` | High-performance, interruptible Fibers with seamless resource management. |
| **5. Resilience Patterns** | `@wts/resilience` | Sophisticated retry (exponential, jitter), circuit breakers, and timeouts. |
| **6. Caching** | `@wts/caching` | Multi-policy (LRU, LFU, TTL), statistics tracking, and async memoization. |
| **7. Configuration** | `@wts/config-manager` | Multi-source (env, file, remote), schema validation, and hot-reloading. |
| **8. Observability** | `@wts/observability` | Distributed tracing, rich span management, and decorator-based auto-tracing. |
| **9. Stream Processing** | `@wts/signal` | Advanced stream processing with fine-grained backpressure control. |
| **10. Testing** | `@wts/test` | Expressive assertion library, powerful mocking, and deterministic fake timers. |

## 📦 Installation

```bash
bun add @wts/program
```

## 🛠️ Usage: The Modular Way

Embrace the power of modularity. Instead of importing from a single facade, import directly from the specialized packages you need.

### Example: A Resilient, Observable API Client

This example demonstrates how to combine multiple WTS packages to build a robust API client.

```typescript
// ✅ Recommended: Import directly from specialized packages
import { Result, tryResult } from '@wts/functional';
import { AppError, appError } from '@wts/error';
import { createConfigManager, createEnvSource } from '@wts/config-manager';
import { retryAsync, retryPolicies } from '@wts/resilience';
import { traceAsync } from '@wts/observability';

// --- Configuration ---
interface ApiConfig {
  baseURL: string;
  timeout: number;
}

const config = createConfigManager<ApiConfig>({ 
    sources: [createEnvSource('API_')] 
});

// --- Business Logic ---
interface User {
  id: string;
  name: string;
}

class UserService {
  @traceAsync('get-user')
  async getUser(id: string): Promise<Result<User, AppError>> {
    if (!id) {
      return err(appError('User ID is required', { code: 'INVALID_INPUT' }));
    }

    const apiConfig = await config.get();

    return retryAsync(
      async () => {
        const response = await fetch(`${apiConfig.baseURL}/users/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }
        return response.json() as Promise<User>;
      },
      retryPolicies.exponential({ maxRetries: 5 })
    ).pipe(
      tryResult((error) => appError('Failed to fetch user', { cause: error, userId: id }))
    );
  }
}
```

## 📈 Why `program` is the Superior Choice Over Effect TS

| Feature | `program` (via WTS Packages) | Effect TS |
|---|---|---|
| **Architecture** | ✅ **Modular & Composable** | ❌ Monolithic Layer System |
| **DI System** | ✅ **Flexible & Factory-based** | ⚠️ Rigid & Complex (Layers) |
| **Error Handling** | ✅ **Rich, Composable Errors** | ❌ Basic Error Channels |
| **Resilience** | ✅ **Advanced Policies (Jitter, etc.)** | ❌ Basic Retry Mechanisms |
| **Configuration** | ✅ **Multi-Source & Hot-Reload** | ❌ Rudimentary Support |
| **Testing** | ✅ **Comprehensive Mocking & Fakes** | ❌ Limited Utilities |
| **Bundle Size** | ✅ **Highly Optimized (Tree-shaking)** | ⚠️ Potentially Large |
| **Learning Curve** | ✅ **Gentle & Incremental** | ⚠️ Steep & All-or-Nothing |
| **Developer Experience** | ✅ **Excellent & Type-Safe** | ⚠️ Verbose & Boilerplate-heavy |

## 🏗️ Project Structure Recommendation

We recommend a feature-driven structure that leverages functional programming principles:

```
src/
├── features/      # Business logic grouped by feature
│   └── users/
│       ├── user.service.ts  # Side-effects, business logic
│       ├── user.types.ts    # Domain types
│       └── user.utils.ts    # Pure utility functions
├── core/          # Cross-cutting concerns
│   ├── config.ts      # Configuration setup
│   ├── container.ts   # DI container setup
│   └── tracing.ts     # Observability setup
├── types/         # Global type definitions
└── main.ts        # Application entry point
```

## 📚 Documentation

For detailed API documentation on each package, please refer to the `README.md` within each package's directory.

## 🤝 Contributing

We welcome contributions! Please see our [contributing guide](CONTRIBUTING.md) for details.

## 📄 License

MIT © 2025 WTS Team