import type { CacheEntry } from '../types'
import { isExpired } from '../utils'

export class MemoryCache {
  private cache = new Map<string, CacheEntry>()
  private maxSize: number

  constructor(maxSize = 100) {
    this.maxSize = maxSize
  }

  get<T = unknown>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    if (isExpired(entry.timestamp, entry.ttl)) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  set<T = unknown>(key: string, data: T, ttl: number): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      queryKey: []
    })
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    if (isExpired(entry.timestamp, entry.ttl)) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  size(): number {
    return this.cache.size
  }

  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  cleanup(): number {
    let removed = 0

    for (const [key, entry] of this.cache.entries()) {
      if (isExpired(entry.timestamp, entry.ttl)) {
        this.cache.delete(key)
        removed++
      }
    }

    return removed
  }
}
