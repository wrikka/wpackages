# @wpackages/cache

> Functional caching library with memoization, TTL, and LRU eviction

A comprehensive caching library built with functional programming principles. Provides memoization, TTL (Time To Live), LRU (Least Recently Used) eviction, and lazy evaluation utilities.

## ✨ Features

- 🗄️ **In-Memory Cache**: Fast key-value cache with configurable options
- ⏱️ **TTL Support**: Automatic expiration of cached entries
- 📊 **LRU Eviction**: Automatic eviction of least recently used entries
- 🧠 **Memoization**: Cache function results automatically
- 🔄 **Async Support**: Memoize async functions with lazy evaluation
- 🧩 **WeakMap Support**: Memory-efficient memoization for objects
- 💾 **Storage Backends**: LocalStorage and SessionStorage adapters
- 🔁 **Retry Cache**: Automatic retry for failed cache lookups

## 🎯 Goal

- ⚡ Improve application performance through intelligent caching
- 🧹 Reduce redundant computations with memoization
- 📦 Provide flexible caching strategies for different use cases
- 🔒 Ensure type safety with full TypeScript support

## 🏗️ Architecture

### Key Concepts

- **Pure Functions**: All cache operations are side-effect free
- **Configurable Eviction**: Choose between TTL, LRU, or both
- **Lazy Evaluation**: Defer computation until needed
- **Storage Abstraction**: Pluggable storage backends

## 📦 Installation

```bash
bun add @wpackages/cache
```

## 🚀 Usage

### Basic Cache

```typescript
import { createCache } from "@wpackages/cache";

// Create a cache with TTL and LRU eviction
const cache = createCache<string, number>({
  maxSize: 100,  // Maximum entries (LRU)
  ttl: 5000,     // 5 seconds TTL
  lru: true,     // Enable LRU eviction
});

// Set and get values
cache.set("key1", 42);
cache.get("key1"); // 42

// Check if key exists
cache.has("key1"); // true

// Delete a key
cache.delete("key1");

// Clear all entries
cache.clear();

// Get cache statistics
cache.stats(); // { size: 0, hits: 1, misses: 0 }
```

### Memoization

```typescript
import { memoize, memoizeAsync, memoizeWeak } from "@wpackages/cache";

// Sync function memoization
const expensiveFn = memoize((x: number) => {
  console.log("Computing...");
  return x * x;
});

expensiveFn(5); // "Computing..." -> 25
expensiveFn(5); // 25 (cached, no log)

// Async function memoization
const fetchUser = memoizeAsync(async (id: string) => {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
});

await fetchUser("123"); // Fetches from API
await fetchUser("123"); // Returns cached result

// WeakMap memoization for objects (memory-efficient)
const processObject = memoizeWeak((obj: { id: number }) => {
  return obj.id * 2;
});
```

### TTL Cache

```typescript
import { createTTLCache } from "@wpackages/cache";

const ttlCache = createTTLCache<string, User>({
  ttl: 60000, // 1 minute
});

ttlCache.set("user:123", { name: "John" });

// Entry automatically expires after TTL
setTimeout(() => {
  ttlCache.get("user:123"); // undefined (expired)
}, 65000);
```

### Auto-Key Cache

```typescript
import { createAutoKeyCache } from "@wpackages/cache";

// Automatically generate cache keys from function arguments
const autoCache = createAutoKeyCache({
  ttl: 30000,
});

const cachedFetch = autoCache.wrap(async (url: string) => {
  const res = await fetch(url);
  return res.json();
});
```

### Lazy Evaluation

```typescript
import { lazy, asyncLazy } from "@wpackages/cache";

// Lazy value - computed only when accessed
const lazyValue = lazy(() => {
  console.log("Computing lazy value...");
  return expensiveComputation();
});

lazyValue.get(); // "Computing lazy value..."
lazyValue.get(); // Returns cached result

// Async lazy
const asyncValue = asyncLazy(async () => {
  const res = await fetch("/api/config");
  return res.json();
});

await asyncValue.get(); // Fetches and caches
```

### Storage Backends

```typescript
import { createLocalStorageCache, createSessionStorageCache } from "@wpackages/cache";

// LocalStorage-backed cache (persistent)
const localCache = createLocalStorageCache<{ theme: string }>({
  prefix: "app:",
  ttl: 86400000, // 1 day
});

localCache.set("theme", "dark");
// Persists across browser sessions

// SessionStorage-backed cache (session-only)
const sessionCache = createSessionStorageCache<{ token: string }>({
  prefix: "auth:",
});

sessionCache.set("token", "abc123");
// Cleared when browser tab closes
```

### Retry Cache

```typescript
import { createRetryCache } from "@wpackages/cache";

const retryCache = createRetryCache({
  maxRetries: 3,
  retryDelay: 1000,
});

// Automatically retry failed lookups
const value = await retryCache.getOrSet("key", async () => {
  return await fetchDataFromUnreliableSource();
});
```

## 📚 API Reference

### Core Functions

| Function | Description |
|----------|-------------|
| `createCache(config)` | Create a new cache instance |
| `createTTLCache(config)` | Create cache with TTL support |
| `createAutoKeyCache(config)` | Create cache with auto-key generation |
| `createRetryCache(config)` | Create cache with retry support |

### Memoization

| Function | Description |
|----------|-------------|
| `memoize(fn)` | Memoize sync function |
| `memoizeAsync(fn)` | Memoize async function |
| `memoizeWeak(fn)` | Memoize with WeakMap |
| `memoizeWith(fn, keyGen)` | Memoize with custom key generator |

### Lazy Evaluation

| Function | Description |
|----------|-------------|
| `lazy(fn)` | Create lazy value |
| `asyncLazy(fn)` | Create async lazy value |

### Storage Backends

| Function | Description |
|----------|-------------|
| `createLocalStorageCache(config)` | LocalStorage-backed cache |
| `createSessionStorageCache(config)` | SessionStorage-backed cache |

### Cache Configuration

| Option | Type | Description |
|--------|------|-------------|
| `maxSize` | `number` | Maximum entries (for LRU) |
| `ttl` | `number` | Time to live in milliseconds |
| `lru` | `boolean` | Enable LRU eviction |
| `prefix` | `string` | Key prefix for storage backends |

## 🛠️ Development

```bash
# Install dependencies
bun install

# Run tests
bun run test

# Run tests with watch
bun run test:watch

# Run tests with coverage
bun run test:coverage

# Build
bun run build

# Lint
bun run lint

# Format
bun run format

# Full verification
bun run verify
```

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `dev` | Development mode with watch |
| `build` | Build with tsdown |
| `test` | Run tests |
| `test:watch` | Run tests in watch mode |
| `test:coverage` | Run tests with coverage |
| `lint` | Type check and lint |
| `format` | Format with dprint |
| `verify` | Full verification |

## 📄 License

MIT