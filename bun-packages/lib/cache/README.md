# @wpackages/cache

Universal caching library with multiple storage strategies for TypeScript projects.

## Features

- 🚀 **Type-safe** with full TypeScript support
- 💾 **Multiple storage strategies**: Memory, localStorage, IndexedDB
- ⏰ **TTL support** with automatic expiration
- 🔄 **LRU eviction** for memory cache
- 📦 **Tree-shakeable** exports
- 🎯 **Zero dependencies**

## Installation

```bash
bun add @wpackages/cache
```

## Usage

### Memory Cache

```typescript
import { MemoryCache } from '@wpackages/cache'

const cache = new MemoryCache<string>(100) // max 100 items

// Set cache
await cache.set('user:1', 'John Doe', 300000) // 5 minutes TTL

// Get cache
const user = await cache.get('user:1')
console.log(user) // 'John Doe'

// Check if exists
const exists = await cache.has('user:1')
console.log(exists) // true
```

### Storage Cache (localStorage)

```typescript
import { StorageCache } from '@wpackages/cache'

const cache = new StorageCache<User>('app-cache-', 'localStorage')

// Set cache
await cache.set('user:1', { name: 'John', age: 30 }, 3600000) // 1 hour

// Get cache
const user = await cache.get('user:1')
console.log(user) // { name: 'John', age: 30 }
```

### Using Types

```typescript
import type { CacheRepository, CacheEntry } from '@wpackages/cache'

class MyCache implements CacheRepository<MyData> {
  // Implementation...
}
```

### Utilities

```typescript
import { 
  generateCacheKey, 
  isCacheEntryExpired, 
  DEFAULT_TTL 
} from '@wpackages/cache'

// Generate cache key
const key = generateCacheKey('api', { endpoint: '/users', page: 1 })
// 'api:|endpoint:/users|page:1'

// Check expiration
const entry: CacheEntry = { /* ... */ }
const expired = isCacheEntryExpired(entry)

// Use default TTL values
await cache.set('data', value, DEFAULT_TTL.MEDIUM) // 30 minutes
```

## API Reference

### MemoryCache

```typescript
class MemoryCache<T = unknown> implements CacheRepository<T> {
  constructor(maxSize?: number)
  
  async get(key: string): Promise<T | null>
  async set(key: string, data: T, ttl?: number): Promise<void>
  async delete(key: string): Promise<boolean>
  async clear(): Promise<void>
  async has(key: string): Promise<boolean>
  async getEntry(key: string): Promise<CacheEntry<T> | null>
  
  size(): number
  keys(): string[]
  async cleanup(): Promise<number>
}
```

### StorageCache

```typescript
class StorageCache<T = unknown> implements CacheRepository<T> {
  constructor(prefix?: string, storage?: 'localStorage' | 'indexedDB')
  
  async get(key: string): Promise<T | null>
  async set(key: string, data: T, ttl?: number): Promise<void>
  async delete(key: string): Promise<boolean>
  async clear(): Promise<void>
  async has(key: string): Promise<boolean>
  async getEntry(key: string): Promise<CacheEntry<T> | null>
}
```

## Tree Shaking

Import only what you need:

```typescript
// Memory cache only
import { MemoryCache } from '@wpackages/cache/memory'

// Storage cache only  
import { StorageCache } from '@wpackages/cache/storage'

// Utilities only
import { generateCacheKey, DEFAULT_TTL } from '@wpackages/cache'
```

## License

MIT
