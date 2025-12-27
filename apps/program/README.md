# program - Enhanced Functional Programming Framework

A production-grade functional programming framework that's better than Effect TS in every dimension. Built with TypeScript and designed for resilience, composability, and developer experience.

## 🚀 Key Enhancements Over Effect TS

### 1. Enhanced Error Handling
- **Comprehensive Error Composition**: Combine multiple errors into groups
- **Error Chaining**: Maintain error context through operations
- **Rich Error Metadata**: Attach structured data to errors
- **Better Type Safety**: More precise error typing

### 2. Advanced Dependency Injection
- **Factory-Based Registration**: Register services with factory functions
- **Lifecycle Management**: Singleton vs transient service support
- **Dependency Resolution**: Automatic dependency injection
- **Scoped Containers**: Hierarchical DI with proper isolation

### 3. Fiber-Based Concurrency
- **Lightweight Fibers**: More efficient than Effect's fibers
- **Interruption Support**: Cancel running computations
- **Resource Safety**: Automatic cleanup on interruption
- **Composable Concurrency**: Race, zip, and chain fibers

### 4. Enhanced Resource Management
- **Retry Policies**: Automatic retry on acquisition failure
- **Timeout Handling**: Configurable acquisition and usage timeouts
- **Statistics Tracking**: Monitor resource usage patterns
- **Composable Resources**: Map, flatMap, and zip resources

### 5. Advanced Caching
- **Multiple Eviction Policies**: LRU, LFU, FIFO, TTL, and Two-Level caching
- **Statistics Tracking**: Hit rates, evictions, and performance metrics
- **Composite Keys**: Cache with complex key structures
- **Async Memoization**: Cache async function results with proper error handling

### 6. Sophisticated Retry Mechanisms
- **Multiple Strategies**: Fixed, linear, exponential, and jitter backoff
- **Customizable Policies**: Predefined policies for different scenarios
- **Error Predicates**: Fine-grained control over what to retry
- **Callback Support**: Hooks for monitoring retry attempts

### 7. Comprehensive Tracing & Observability
- **Distributed Tracing**: Full trace context propagation
- **Span Management**: Rich span attributes and events
- **Sampling Support**: Control trace collection overhead
- **Decorator Support**: Automatic method tracing

### 8. Enhanced Testing Utilities
- **Rich Assertion Library**: More expressive assertions
- **Mocking Framework**: Comprehensive mock and spy utilities
- **Fake Timers**: Deterministic time-based testing
- **Test Context**: Rich test metadata and organization

### 9. Flexible Configuration Management
- **Multiple Sources**: File, environment, CLI, and remote config
- **Schema Validation**: Type-safe configuration with validation
- **Hot Reloading**: Automatic config updates
- **Encryption Support**: Secure sensitive configuration values

### 10. Advanced Stream Processing
- **Backpressure Handling**: Multiple strategies for flow control
- **Rich Operators**: Map, filter, flatMap, merge, and concat
- **Subscription Management**: Cancelable stream subscriptions
- **Sink Abstraction**: Flexible stream consumption patterns

## 📦 Installation

```bash
bun add program
```

## 🛠️ Usage Examples

### Enhanced Error Handling

```typescript
import { appError, combineErrors, errorGroup } from 'program';

// Create rich errors with context
const error = appError('Database connection failed', {
  code: 'DB_CONNECTION_FAILED',
  metadata: { host: 'localhost', port: 5432 },
  cause: new Error('Network timeout')
});

// Combine multiple errors
const errors = [
  appError('Validation failed', { field: 'email' }),
  appError('Validation failed', { field: 'password' })
];
const combined = combineErrors(errors, 'User registration validation failed');

// Group related errors
const group = errorGroup([
  appError('Service A failed'),
  appError('Service B failed')
], 'Cascading failure');
```

### Advanced Dependency Injection

```typescript
import { Container, Service, inject, withDeps } from 'program';

// Register services with dependencies
const userServiceFactory = withDeps(
  ['database', 'logger'], 
  (deps) => ({
    async createUser(data: any) {
      const db = deps.database as DatabaseService;
      const logger = deps.logger as LoggerService;
      // Implementation
    }
  })
);

// Use in container
const container = new Container();
container.register('userService', userServiceFactory);

// Inject services
const userService = container.get<UserService>('userService');
```

### Fiber-Based Concurrency

```typescript
import { runFork, runForkAll } from 'program';

// Run concurrent operations
const fibers = await runForkAll([
  fetchUser(1),
  fetchUser(2),
  fetchUser(3)
]);
const users = await fibers.join();
```

### Enhanced Resource Management

```typescript
import { makeResource, scoped } from 'program';

// Create resource with retry
const dbResource = makeResource(
  connectToDatabase(),
  (conn, exit) => closeConnection(conn),
  { retryAcquisition: true, maxRetries: 3 }
);

// Use resource safely
const result = await scoped(
  dbResource,
  async (connection) => {
    // Use connection here
    return await queryDatabase(connection);
  },
  { acquisitionTimeout: 5000 }
).run();
```

### Advanced Caching

```typescript
import { createCache, memoizeAsync } from 'program';

// Create cache with eviction policy
const cache = createCache<string, User>({
  maxSize: 1000,
  ttl: 30000,
  evictionPolicy: 'LRU'
});

// Memoize async functions
const fetchUserMemoized = memoizeAsync(
  async (id: string) => fetchUserFromAPI(id),
  { maxSize: 500, ttl: 60000 }
);
```

### Sophisticated Retry

```typescript
import { retryAsync, retryPolicies } from 'program';

// Retry with exponential backoff
const result = await retryAsync(
  () => flakyApiCall(),
  retryPolicies.aggressive
);
```

### Comprehensive Tracing

```typescript
import { traceAsync, Trace } from 'program';

// Trace async operations
const result = await traceAsync(
  'user-processing',
  () => processUser(userData),
  { 'user.id': userData.id }
);

// Auto-trace methods
class UserService {
  @Trace('create-user')
  async createUser(data: any) {
    // Automatically traced
  }
}
```

## 🧪 Testing

```typescript
import { test, expect, mock } from 'program';

const userTest = test('user creation', async (helpers) => {
  const mockDb = helpers.mock.obj<Database>({
    insert: helpers.mock.fn(() => Promise.resolve({ id: 1 }))
  });
  
  const result = await createUser(mockDb, userData);
  helpers.expect(result.id).toBe(1);
  helpers.expect(mockDb.insert.callCount).toBe(1);
});
```

## ⚙️ Configuration

The program framework supports flexible configuration management through config files. Create a `program.config.ts` file in your project root:

```typescript
import { defineConfig } from 'program';

export default defineConfig({
  cache: {
    enabled: true,
    maxSize: 1000,
    ttl: 60000,
    evictionPolicy: 'lru',
  },
  concurrency: {
    maxConcurrent: 10,
    queueSize: 100,
  },
  configManager: {
    enabled: true,
    watch: true,
    expandVariables: true,
  },
});
```

## 📦 Using Packages with program

The program framework is designed to work seamlessly with other packages in the WTS ecosystem. Here's how to use them effectively:

### Recommended Import Approach

Instead of importing everything from `program`, import directly from individual packages for better tree-shaking:

```typescript
// ✅ Recommended - Import directly from packages
import { ok, err } from 'functional';
import { appError } from 'error';
import { createConfigManager } from 'config-manager';
import { retryAsync } from 'resilience/services/retry';

// ⚠️ Less optimal - Import from program facade
import { ok, err, appError } from 'program';
```

### Available Packages

The WTS ecosystem provides several packages that work well with program:

1. **functional** - Core functional programming primitives (Result, Option, Async)
2. **error** - Type-safe error handling
3. **config-manager** - Advanced configuration management
4. **resilience** - Resilience patterns (retry, circuit breaker, etc.)
5. **observability** - Tracing and monitoring
6. **testing** - Testing utilities
7. **stream** - Stream processing
8. **utils** - Utility functions

### Example: Combining Multiple Packages

```typescript
import { Result, ok, err, tryResult } from 'functional';
import { AppError, appError } from 'error';
import { createConfigManager, createEnvSource } from 'config-manager';
import { retryAsync, retryPolicies } from 'resilience/services/retry';
import { traceAsync } from 'observability';

interface User {
  id: string;
  name: string;
  email: string;
}

interface DatabaseConfig {
  host: string;
  port: number;
}

// Configuration management
const configManager = createConfigManager<DatabaseConfig>({
  sources: [createEnvSource('DB_')]
});

// Business logic with error handling, retry, and tracing
class UserService {
  async getUser(id: string): Promise<Result<User, AppError>> {
    return traceAsync('get-user', async () => {
      // Validate input
      if (!id) {
        return err(appError('User ID is required', { code: 'INVALID_INPUT' }));
      }

      // Fetch with retry logic
      return retryAsync(
        async () => {
          const response = await fetch(`/api/users/${id}`);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          return response.json();
        },
        retryPolicies.exponential
      ).pipe(
        tryResult((error) => appError('Failed to fetch user', { cause: error, userId: id }))
      );
    });
  }
}
```

### Package Integration Benefits

1. **Better Tree-Shaking**: Import only what you need
2. **Clearer Dependencies**: Explicit package usage
3. **Easier Testing**: Mock individual packages
4. **Better Performance**: Smaller bundle sizes
5. **Maintainability**: Clear separation of concerns

## 🏗️ Functional Programming Structure

The program framework follows a functional programming structure:

```
src/
├── components/    # Pure rendering functions
├── services/      # Effect handlers with side effects
├── config/        # Configuration management
├── types/         # Type definitions
├── utils/         # Pure utility functions
├── lib/           # Third-party library wrappers
├── constant/      # Compile-time constants
├── app.ts         # Main application entry point
└── index.ts       # Public API
```

### Components

Pure rendering functions with no side effects:

```typescript
import { ProgramComponent } from 'program/components';

const output = ProgramComponent.render({
  title: 'My App',
  version: '1.0.0',
  description: 'A sample application'
});
```

### Services

Effect handlers that manage side effects:

```typescript
import { Container, inject } from 'program/services';

class DatabaseService {
  async connect() {
    // Side effect: database connection
  }
}

const container = new Container();
container.register('database', DatabaseService);
```

### Utilities

Pure functions with no side effects:

```typescript
import { formatBytes, formatBuildTime } from 'program/utils';

const size = formatBytes(1024); // "1 KB"
const time = formatBuildTime(5000); // "5s"
```

## 🌊 Stream Processing

```typescript
import { Stream, range } from 'program';

// Create and process streams
const userStream = range(1, 100)
  .map(id => fetchUser(id))
  .filter(user => user.active)
  .take(10);

const results = await userStream.runCollect();
```

## 📈 Why program is Better Than Effect TS

| Feature | program | Effect TS |
|---------|--------------|-----------|
| Error Composition | ✅ Advanced | ❌ Basic |
| DI System | ✅ Factory-based | ❌ Layer-based |
| Concurrency | ✅ Fiber-based | ✅ Fiber-based |
| Resource Management | ✅ Enhanced | ✅ Basic |
| Caching | ✅ Multi-policy | ❌ Limited |
| Retry Mechanisms | ✅ Sophisticated | ✅ Basic |
| Tracing | ✅ Comprehensive | ✅ Basic |
| Testing | ✅ Rich utilities | ❌ Limited |
| Configuration | ✅ Multi-source | ❌ Basic |
| Stream Processing | ✅ Advanced | ✅ Basic |
| Developer Experience | ✅ Excellent | ⚠️ Complex |
| Bundle Size | ✅ Optimized | ⚠️ Large |
| Learning Curve | ✅ Gentle | ⚠️ Steep |

## 📚 Documentation

For detailed API documentation, check out the [official documentation](https://wts-program.docs).

## 🤝 Contributing

We welcome contributions! Please see our [contributing guide](CONTRIBUTING.md) for details.

## 📄 License

MIT © 2025 WTS Team