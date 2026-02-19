/**
 * Cache repository implementation
 * In-memory caching implementation
 */

import type { CacheRepository } from '../interfaces'
import type { CacheEntry } from '../../types'
import { isCacheEntryExpired } from '../utils'

export class CacheRepositoryImpl<TData = unknown> implements CacheRepository<TData> {
  private cache: Map<string, CacheEntry<TData>> = new Map()

  async get(key: string): Promise<TData | null> {
    const entry = this.cache.get(key)
    if (!entry) {
      return null
    }

    if (isCacheEntryExpired(entry)) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  async set(key: string, data: TData, ttl: number = 300000): Promise<void> {
    const entry: CacheEntry<TData> = {
      data,
      timestamp: Date.now(),
      ttl,
      queryKey: [key]
    }

    this.cache.set(key, entry)
  }

  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key)
  }

  async clear(): Promise<void> {
    this.cache.clear()
  }

  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key)
    if (!entry) {
      return false
    }

    if (isCacheEntryExpired(entry)) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  async getEntry(key: string): Promise<CacheEntry<TData> | null> {
    const entry = this.cache.get(key)
    if (!entry) {
      return null
    }

    if (isCacheEntryExpired(entry)) {
      this.cache.delete(key)
      return null
    }

    return entry
  }
}
