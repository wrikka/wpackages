import type {
  QueryOptions,
  QueryResult,
  MutationOptions,
  MutationResult,
  CacheConfig,
  HTTPAdapter
} from '../types'
import { MemoryCache } from '../cache/memory-cache'
import { StorageCache } from '../cache/storage-cache'
import { generateQueryKey } from '../utils'
import { DataFetchingError } from '../error'

export class DataFetcher {
  private cache: MemoryCache | StorageCache
  private queries = new Map<string, Promise<unknown>>()
  private mutations = new Map<string, Promise<unknown>>()

  constructor(
    _adapter: HTTPAdapter,
    cacheConfig: CacheConfig = {}
  ) {
    this.cache = cacheConfig.storage === 'localStorage'
      ? new StorageCache('data-fetching-')
      : new MemoryCache(cacheConfig.maxSize)
  }

  async query<TData = unknown>(options: QueryOptions<TData>): Promise<QueryResult<TData>> {
    const queryKey = generateQueryKey(options.queryKey)
    const { queryFn, staleTime = 300000, cacheTime = 300000, enabled = true } = options

    if (!enabled) {
      return {
        data: undefined,
        error: null,
        isLoading: false,
        isError: false,
        isSuccess: false,
        isFetching: false,
        isRefetching: false,
        refetch: () => Promise.reject(new Error('Query is disabled')),
        invalidate: () => { }
      }
    }

    const cachedData = this.cache.get<TData>(queryKey)
    const isStale = cachedData ? this.isDataStale(queryKey, staleTime) : true

    const result: QueryResult<TData> = {
      data: cachedData ?? undefined,
      error: null,
      isLoading: !cachedData,
      isError: false,
      isSuccess: !!cachedData,
      isFetching: !cachedData || isStale,
      isRefetching: !!cachedData && isStale,
      refetch: () => this.refetchQuery(queryKey, queryFn, cacheTime),
      invalidate: () => this.invalidateQuery(queryKey)
    }

    if (!cachedData || isStale) {
      if (!this.queries.has(queryKey)) {
        const promise = this.executeQuery(queryFn, queryKey, cacheTime)
        this.queries.set(queryKey, promise)

        promise
          .then(data => {
            result.data = data
            result.isLoading = false
            result.isFetching = false
            result.isRefetching = false
            result.isSuccess = true
          })
          .catch(error => {
            result.error = error
            result.isLoading = false
            result.isFetching = false
            result.isRefetching = false
            result.isError = true
            result.isSuccess = false
          })
          .finally(() => {
            this.queries.delete(queryKey)
          })
      }
    }

    return result
  }

  async mutate<TData = unknown, TVariables = void>(
    options: MutationOptions<TData, Error, TVariables>
  ): Promise<MutationResult<TData, Error, TVariables>> {
    const { mutationFn, retry = 3, retryDelay = 1000 } = options
    const mutationId = Math.random().toString(36)

    const result: MutationResult<TData, Error, TVariables> = {
      data: undefined,
      error: null,
      isPending: true,
      isError: false,
      isSuccess: false,
      isIdle: false,
      reset: () => this.resetMutation(mutationId),
      mutate: (variables?: TVariables) => this.executeMutation(mutationFn, variables!, retry, retryDelay),
      mutateAsync: (variables) => this.executeMutation(mutationFn, variables, retry, retryDelay)
    }

    return result
  }

  private async executeQuery<TData>(
    queryFn: () => Promise<TData>,
    queryKey: string,
    cacheTime: number
  ): Promise<TData> {
    try {
      const data = await queryFn()
      this.cache.set(queryKey, data, cacheTime)
      return data
    } catch (error) {
      if (error instanceof DataFetchingError) {
        throw error
      }
      throw new DataFetchingError('Query failed', undefined, undefined, undefined)
    }
  }

  private async executeMutation<TData, TVariables>(
    mutationFn: (variables: TVariables) => Promise<TData>,
    variables: TVariables,
    retry: number,
    retryDelay: number
  ): Promise<TData> {
    let lastError: Error

    for (let attempt = 0; attempt <= retry; attempt++) {
      try {
        return await mutationFn(variables)
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')

        if (attempt < retry) {
          await new Promise(resolve => setTimeout(resolve, createRetryDelay(attempt, retryDelay)))
        }
      }
    }

    throw lastError!
  }

  private async refetchQuery<TData>(
    queryKey: string,
    queryFn: () => Promise<TData>,
    cacheTime: number
  ): Promise<TData> {
    this.cache.delete(queryKey)
    return this.executeQuery(queryFn, queryKey, cacheTime)
  }

  private invalidateQuery(queryKey: string): void {
    this.cache.delete(queryKey)
  }

  private resetMutation(mutationId: string): void {
    this.mutations.delete(mutationId)
  }

  private isDataStale(queryKey: string, staleTime: number): boolean {
    const cachedData = this.cache.get(queryKey)
    if (!cachedData) return true

    const entry = (this.cache as any).cache?.get(queryKey) ||
      JSON.parse(localStorage.getItem(`data-fetching-${queryKey}`) || '{}')

    return Date.now() - entry.timestamp > staleTime
  }

  clearCache(): void {
    this.cache.clear()
  }

  getCacheSize(): number {
    return this.cache.size()
  }

  cleanupCache(): number {
    if ('cleanup' in this.cache) {
      return (this.cache as any).cleanup()
    }
    return 0
  }
}
