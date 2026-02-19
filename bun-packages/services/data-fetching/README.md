# @wpackages/data-fetching

Universal data fetching service with smart caching and type safety for TypeScript applications.

## Features

- 🔴 **Universal Adapter** - Works with any HTTP client (fetch, axios, etc.)
- 🔴 **Smart Caching** - Multi-level caching (memory, localStorage, IndexedDB)
- 🔴 **Type Safety** - Full TypeScript with inference
- 🔴 **Error Handling** - Retry, exponential backoff, circuit breaker
- 🟡 **Real-time Support** - WebSocket, SSE, polling options
- 🟡 **Offline Support** - Sync when back online
- 🟡 **Request Deduplication** - Prevent duplicate requests
- 🟡 **Background Updates** - Refetch in background
- 🟢 **Developer Tools** - Debug panel for development
- 🟢 **Analytics** - Track performance metrics

## Installation

```bash
bun add @wpackages/data-fetching
```

## Quick Start

```typescript
import { DataFetcher, FetchAdapter } from '@wpackages/data-fetching'

// Create adapter and fetcher
const adapter = new FetchAdapter({
  baseURL: 'https://api.example.com',
  timeout: 10000
})

const fetcher = new DataFetcher(adapter, {
  storage: 'memory',
  ttl: 300000
})

// Query data
const result = await fetcher.query({
  queryKey: ['users', '123'],
  queryFn: () => adapter.get('/users/123'),
  staleTime: 60000
})

// Mutate data
const mutation = await fetcher.mutate({
  mutationFn: (userData) => adapter.post('/users', userData),
  onSuccess: (data) => console.log('User created:', data)
})
```

## Architecture

```
src/
├── types/         # Type definitions
├── constants/     # Configuration constants
├── utils/         # Helper functions
├── error/         # Error handling
├── cache/         # Caching strategies
├── adapters/      # HTTP adapters
├── services/      # Core data fetching logic
└── lib/           # Public API exports
```

## License

MIT
