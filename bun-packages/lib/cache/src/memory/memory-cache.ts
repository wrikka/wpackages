/**
 * Memory cache implementation
 */

import type { CacheRepository, CacheEntry } from '../types'
import { isCacheEntryExpired } from '../utils'

export class MemoryCache<TData = unknown> implements CacheRepository<TData> {
  private cache = new Map<string, CacheEntry<TData>>()
  private maxSize: number

  constructor(maxSize = 100) {
    this.maxSize = maxSize
  }

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

  async set(key: string, data: TData, ttl = 300000): Promise<void> {
    // LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

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
    if (!entry) return false

    if (isCacheEntryExpired(entry)) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  async getEntry(key: string): Promise<CacheEntry<TData> | null> {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (isCacheEntryExpired(entry)) {
      this.cache.delete(key)
      return null
    }

    return entry
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size
  }

  /**
   * Get all cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * Cleanup expired entries
   */
  async cleanup(): Promise<number> {
    let removed = 0

    for (const [key, entry] of this.cache.entries()) {
      if (isCacheEntryExpired(entry)) {
        this.cache.delete(key)
        removed++
      }
    }

    return removed
  }
}
