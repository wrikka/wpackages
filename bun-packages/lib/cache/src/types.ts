/**
 * Cache entry interface
 */
export interface CacheEntry<TData = unknown> {
  data: TData
  timestamp: number
  ttl: number
  queryKey: readonly unknown[]
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  ttl?: number
  maxSize?: number
  storage?: 'memory' | 'localStorage' | 'indexedDB'
  strategy?: 'cache-first' | 'network-first' | 'stale-while-revalidate'
}

/**
 * Cache repository interface
 */
export interface CacheRepository<TData = unknown> {
  get(key: string): Promise<TData | null>
  set(key: string, data: TData, ttl?: number): Promise<void>
  delete(key: string): Promise<boolean>
  clear(): Promise<void>
  has(key: string): Promise<boolean>
  getEntry(key: string): Promise<CacheEntry<TData> | null>
}
