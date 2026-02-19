export interface DataFetcherConfig {
  baseURL?: string
  timeout?: number
  retries?: number
  retryDelay?: number
  cache?: CacheConfig
  headers?: Record<string, string>
}

export interface CacheConfig {
  ttl?: number
  maxSize?: number
  storage?: 'memory' | 'localStorage' | 'indexedDB'
  strategy?: 'cache-first' | 'network-first' | 'stale-while-revalidate'
}

export interface QueryOptions<TData = unknown> {
  queryKey: readonly unknown[]
  queryFn: () => Promise<TData>
  staleTime?: number
  cacheTime?: number
  refetchOnWindowFocus?: boolean
  refetchOnReconnect?: boolean
  refetchInterval?: number
  enabled?: boolean
  retry?: number
  retryDelay?: number
}

export interface MutationOptions<TData = unknown, TError = Error, TVariables = void> {
  mutationFn: (variables: TVariables) => Promise<TData>
  onMutate?: (variables: TVariables) => Promise<unknown> | unknown
  onSuccess?: (data: TData, variables: TVariables) => void
  onError?: (error: TError, variables: TVariables) => void
  onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables) => void
  retry?: number
  retryDelay?: number
}

export interface QueryResult<TData = unknown, TError = Error> {
  data: TData | undefined
  error: TError | null
  isLoading: boolean
  isError: boolean
  isSuccess: boolean
  isFetching: boolean
  isRefetching: boolean
  refetch: () => Promise<TData>
  invalidate: () => void
}

export interface MutationResult<TData = unknown, TError = Error, TVariables = void> {
  data: TData | undefined
  error: TError | null
  isPending: boolean
  isError: boolean
  isSuccess: boolean
  isIdle: boolean
  reset: () => void
  mutate: (variables?: TVariables) => Promise<TData>
  mutateAsync: (variables: TVariables) => Promise<TData>
}

export interface CacheEntry<TData = unknown> {
  data: TData
  timestamp: number
  ttl: number
  queryKey: readonly unknown[]
}

export interface HTTPAdapter {
  get<T = unknown>(url: string, options?: RequestInit): Promise<T>
  post<T = unknown>(url: string, data?: unknown, options?: RequestInit): Promise<T>
  put<T = unknown>(url: string, data?: unknown, options?: RequestInit): Promise<T>
  patch<T = unknown>(url: string, data?: unknown, options?: RequestInit): Promise<T>
  delete<T = unknown>(url: string, options?: RequestInit): Promise<T>
}

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface RequestConfig extends Omit<RequestInit, 'body' | 'headers'> {
  method?: RequestMethod
  headers?: Record<string, string> | HeadersInit
  params?: Record<string, string>
  data?: unknown
  body?: BodyInit | null
}
