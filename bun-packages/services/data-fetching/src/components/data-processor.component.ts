import type { CacheEntry } from '../types'

export class DataProcessor {
  static processCacheEntry<T>(entry: CacheEntry<T>): T {
    return entry.data
  }

  static validateQueryKey(key: readonly unknown[]): boolean {
    return Array.isArray(key) && key.length > 0
  }

  static hashQueryKey(key: readonly unknown[]): string {
    return JSON.stringify(key)
  }

  static mergeCacheData<T>(_existing: T | null, incoming: T): T {
    return incoming
  }
}
