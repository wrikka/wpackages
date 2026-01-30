# @wpackages/query

A powerful, TanStack Query-inspired data-fetching and state management library for TypeScript applications. Provides robust caching, background refetching, optimistic updates, and framework-agnostic composables.

## Features

- 🚀 **Powerful Caching**: Intelligent caching with TTL, background refetching, and cache invalidation
- 🔄 **Background Updates**: Automatic refetching on window focus, reconnect, and custom intervals
- 🎯 **Optimistic Updates**: Update UI instantly before server confirmation
- 🧩 **Framework Agnostic**: Core library works with any framework, Vue composables included
- 🔑 **Query Keys**: Array-based query keys for complex data relationships
- ⚡ **Type-Safe**: Full TypeScript support with generic types
- 🔄 **Retry Logic**: Configurable retry with exponential backoff
- 🧠 **Smart Deduplication**: Prevent duplicate requests for the same data

## Installation

```bash
bun add @wpackages/query vue
```

## Quick Start

### Vue 3 Usage

```vue
<template>
  <div>
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="isError">Error: {{ error?.message }}</div>
    <div v-else>
      <h1>{{ data?.name }}</h1>
      <p>{{ data?.description }}</p>
      <button @click="mutate">Update Data</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuery, useMutation, provideQueryClient, QueryClient } from '@wpackages/query/vue'

// Provide QueryClient at app root
const queryClient = new QueryClient()
provideQueryClient(queryClient)

// Fetch data
const { data, isLoading, isError, error } = useQuery(
  ['user', '123'], // Query key
  () => fetch('/api/users/123').then(r => r.json()),
  {
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true
  }
)

// Mutation with optimistic update
const { mutate, isLoading: isMutating } = useMutation(
  async (userData) => {
    const response = await fetch('/api/users/123', {
      method: 'PUT',
      body: JSON.stringify(userData)
    })
    return response.json()
  },
  {
    onMutate: async (userData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(['user', '123'])
      
      // Snapshot the previous value
      const previousUser = queryClient.getQueryData(['user', '123'])
      
      // Optimistically update to the new value
      queryClient.setQueryData(['user', '123'], userData)
      
      // Return a context with the previous value
      return { previousUser }
    },
    onError: (err, userData, context) => {
      // Rollback on error
      queryClient.setQueryData(['user', '123'], context?.previousUser)
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries(['user', '123'])
    },
    invalidateQueries: [['user', '123']] // Auto-invalidate on success
  }
)
</script>
```

### Core Usage (Framework Agnostic)

```typescript
import { QueryClient, Query } from '@wpackages/query'

const queryClient = new QueryClient()

// Create a query
const query = queryClient.fetchQuery(
  ['posts', 1],
  () => fetch('/api/posts/1').then(r => r.json())
)

// Subscribe to state changes
const unsubscribe = query.subscribe((state) => {
  console.log('Query state:', state)
})

// Manual refetch
query.refetch()

// Invalidate to force refetch
query.invalidate()

// Set data directly (optimistic update)
query.setData({ id: 1, title: 'Updated Post' })

// Cleanup
unsubscribe()
```

## API Reference

### QueryClient

Central client for managing queries and cache.

```typescript
const client = new QueryClient({
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
  storage: 'memory' // 'memory' | 'localStorage' | 'sessionStorage'
})
```

#### Methods

- `fetchQuery<T>(key, fetcher, options)`: Create or get a query
- `getQuery<T>(key)`: Get existing query
- `setQueryData<T>(key, data)`: Update cached data
- `invalidateQueries(key)`: Invalidate matching queries
- `getCache()`: Access the cache instance

### QueryOptions

```typescript
interface QueryOptions<T> {
  initialData?: T
  staleTime?: number // Time until data is stale
  cacheTime?: number // Time until cache expires
  retry?: number // Number of retry attempts
  retryDelay?: number | ((attempt: number) => number)
  onSuccess?: (data: T) => void
  onError?: (error: unknown) => void
  onSettled?: (data: T | undefined, error: unknown) => void
  refetchOnWindowFocus?: boolean
  refetchOnReconnect?: boolean
  refetchOnMount?: boolean
}
```

### MutationOptions

```typescript
interface MutationOptions<TData, TVariables, TError, TContext> {
  onMutate?: (variables: TVariables) => TContext | Promise<TContext>
  onSuccess?: (data: TData, variables: TVariables, context: TContext) => void
  onError?: (error: TError, variables: TVariables, context?: TContext) => void
  onSettled?: (data: TData | undefined, error: TError | undefined, variables: TVariables, context?: TContext) => void
  retry?: number
  retryDelay?: number | ((attempt: number) => number)
  invalidateQueries?: QueryKey[] // Auto-invalidate on success
}
```

### Vue Composables

#### useQuery

```typescript
const {
  data,           // T | undefined
  error,          // unknown
  isLoading,      // boolean
  isFetching,     // boolean
  isError,        // boolean
  isSuccess,      // boolean
  status,         // 'idle' | 'loading' | 'success' | 'error'
  refetch,        // () => Promise<T>
  invalidate,     // () => void
  setData         // (data: T) => void
} = useQuery<T>(
  key: QueryKey,
  fetcher: () => Promise<T>,
  options?: QueryOptions<T>
)
```

#### useMutation

```typescript
const {
  data,           // TData | undefined
  error,          // TError | undefined
  isLoading,      // boolean
  isError,        // boolean
  isSuccess,      // boolean
  isIdle,         // boolean
  status,         // 'idle' | 'loading' | 'success' | 'error'
  variables,      // TVariables | undefined
  mutate,         // (variables: TVariables) => Promise<TData>
  reset           // () => void
} = useMutation<TData, TVariables, TError, TContext>(
  mutator: (variables: TVariables) => Promise<TData>,
  options?: MutationOptions<TData, TVariables, TError, TContext>
)
```

## Advanced Patterns

### Dependent Queries

```vue
<script setup>
// First query
const { data: user } = useQuery(
  ['user', '123'],
  () => fetch('/api/users/123').then(r => r.json())
)

// Dependent query - only runs when user is available
const { data: posts } = useQuery(
  ['user-posts', user?.id],
  () => fetch(`/api/users/${user.id}/posts`).then(r => r.json()),
  {
    enabled: !!user // Only run when user exists
  }
)
</script>
```

### Pagination

```vue
<script setup>
const page = ref(1)

const { data, isLoading } = useQuery(
  ['posts', page.value],
  () => fetch(`/api/posts?page=${page.value}`).then(r => r.json()),
  {
    keepPreviousData: true // Keep previous data while loading new page
  }
)
</script>
```

## Examples

See the `examples/` directory for complete working examples:

- Basic data fetching
- Mutations with optimistic updates
- Dependent queries
- Pagination
- Error handling
- Custom hooks

## Comparison with TanStack Query

| Feature | @wpackages/query | TanStack Query |
|---------|------------------|---------------|
| Core API | ✅ Inspired by | ✅ Original |
| Vue Composables | ✅ Built-in | ✅ Separate package |
| Optimistic Updates | ✅ Full support | ✅ Full support |
| Query Keys | ✅ Array-based | ✅ Array-based |
| Cache Management | ✅ Centralized | ✅ Centralized |
| TypeScript | ✅ Full support | ✅ Full support |
| Bundle Size | 📦 Smaller | 📦 Larger |
| Framework Support | ✅ Vue + Agnostic | ✅ React + Vue + Solid |

## License

MIT License - see LICENSE file for details.
