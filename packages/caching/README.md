# caching

A comprehensive functional caching library for TypeScript applications with memoization, TTL, LRU eviction, and lazy evaluation.

## Features

- **Functional Design**: Built with pure functions and immutable data structures
- **Memoization**: Automatic caching of function results
- **TTL Support**: Time-to-live expiration for cache entries
- **LRU Eviction**: Least Recently Used entry removal
- **Lazy Evaluation**: Deferred computation with caching
- **Result Types**: Integration with functional Result types
- **Type Safety**: Full TypeScript support with comprehensive type definitions

## Installation

```bash
bun add caching
```

## Usage

### Basic Cache

```typescript
import { createCache } from 'caching'

const cache = createCache<string, number>({ 
  maxSize: 100, 
  ttl: 5000, 
  lru: true 
})

cache.set('key', 42)
const value = cache.get('key') // 42
```

### Memoization

```typescript
import { memoize } from 'caching'

const expensiveFunction = (x: number, y: number) => {
  // Expensive computation
  return x * y
}

const memoizedFunction = memoize(expensiveFunction, { maxSize: 10 })

// First call computes and caches the result
const result1 = memoizedFunction(5, 3) 

// Second call returns cached result
const result2 = memoizedFunction(5, 3)
```

### Lazy Evaluation

```typescript
import { lazy } from 'caching'

const expensiveComputation = () => {
  // Expensive operation
  return 'computed result'
}

const lazyValue = lazy(expensiveComputation, { maxSize: 1 })

// Computation happens only on first access
const result = lazyValue.get()
```

## Advanced Features

### Auto Key Cache

```typescript
import { createAutoKeyCache } from 'caching'

const autoKeyCachedFunction = createAutoKeyCache(expensiveFunction)
```

### TTL Cache

```typescript
import { createTTLCache } from 'caching'

const ttlCachedFunction = createTTLCache(
  expensiveFunction, 
  (result) => result * 1000 // TTL based on result
)
```

### Retry Cache

```typescript
import { createRetryCache } from 'caching'

const retryCachedFunction = createRetryCache(unreliableFunction, 3)
```

### Cache Service

```typescript
import { CacheService } from 'caching'

const cacheService = new CacheService<string, number>()
const result = cacheService.get('key')
```

## API

### Core Types

- `Cache<K, V>`: Main cache interface
- `CacheEntry<T>`: Cache entry with metadata
- `CacheConfig`: Configuration options
- `CacheStats`: Cache statistics

### Core Functions

- `createCache<K, V>(config?)`: Create a new cache instance

### Utilities

- `memoize(fn, config?)`: Memoize a function
- `memoizeAsync(fn, config?)`: Memoize an async function
- `memoizeWith(fn, keyFn, config?)`: Memoize with custom key function
- `memoizeWeak(fn)`: Memoize with WeakMap for object arguments
- `lazy(computation, config?)`: Create a lazy value with caching
- `asyncLazy(computation, config?)`: Create an async lazy value with caching
- `createAutoKeyCache(fn, config?)`: Create cache with automatic key generation
- `createTTLCache(fn, ttlFn, config?)`: Create cache with result-based TTL
- `createRetryCache(fn, maxRetries, config?)`: Create cache with retry mechanism

### Services

- `CacheService<K, V>`: Service class with Result-based API

### Lib Wrappers

- `createLocalStorageCache<T>(key)`: localStorage wrapper
- `createSessionStorageCache<T>(key)`: sessionStorage wrapper

## Configuration

```typescript
interface CacheConfig {
  maxSize?: number    // Maximum cache size (default: Infinity)
  ttl?: number        // Time to live in ms (default: 0 - no expiration)
  lru?: boolean       // Use LRU eviction (default: false - FIFO)
}
```

## Examples

See the usage examples in the test files for comprehensive usage patterns.

## Testing

```bash
# Run tests
bun test

# Run tests with coverage
bun run test:coverage
```

## Building

```bash
# Build the library
bun run build

# Development mode with watch
bun run dev
```

## License

MIT