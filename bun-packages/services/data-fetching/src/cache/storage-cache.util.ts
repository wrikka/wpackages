import type { CacheEntry } from '../types'
import { isExpired } from '../utils'

export class StorageCache {
  private prefix: string
  private storage: Storage

  constructor(prefix = 'data-fetching-', storage: Storage = localStorage) {
    this.prefix = prefix
    this.storage = storage
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`
  }

  private serialize(entry: CacheEntry): string {
    return JSON.stringify(entry)
  }

  private deserialize(value: string): CacheEntry | null {
    try {
      return JSON.parse(value)
    } catch {
      return null
    }
  }

  get<T = unknown>(key: string): T | null {
    const fullKey = this.getKey(key)
    const value = this.storage.getItem(fullKey)
    
    if (!value) {
      return null
    }

    const entry = this.deserialize(value)
    
    if (!entry) {
      this.storage.removeItem(fullKey)
      return null
    }

    if (isExpired(entry.timestamp, entry.ttl)) {
      this.storage.removeItem(fullKey)
      return null
    }

    return entry.data as T
  }

  set<T = unknown>(key: string, data: T, ttl: number): void {
    const fullKey = this.getKey(key)
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl,
      queryKey: []
    }

    try {
      this.storage.setItem(fullKey, this.serialize(entry))
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.cleanup()
        try {
          this.storage.setItem(fullKey, this.serialize(entry))
        } catch {
          throw new Error('Storage quota exceeded even after cleanup')
        }
      }
      throw error
    }
  }

  delete(key: string): boolean {
    const fullKey = this.getKey(key)
    return this.storage.removeItem(fullKey) !== null
  }

  clear(): void {
    const keysToRemove: string[] = []
    
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i)
      if (key?.startsWith(this.prefix)) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach(key => this.storage.removeItem(key))
  }

  has(key: string): boolean {
    const fullKey = this.getKey(key)
    const value = this.storage.getItem(fullKey)
    
    if (!value) {
      return false
    }

    const entry = this.deserialize(value)
    
    if (!entry) {
      this.storage.removeItem(fullKey)
      return false
    }

    if (isExpired(entry.timestamp, entry.ttl)) {
      this.storage.removeItem(fullKey)
      return false
    }

    return true
  }

  size(): number {
    let count = 0
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i)
      if (key?.startsWith(this.prefix)) {
        count++
      }
    }
    return count
  }

  keys(): string[] {
    const keys: string[] = []
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i)
      if (key?.startsWith(this.prefix)) {
        keys.push(key.slice(this.prefix.length))
      }
    }
    return keys
  }

  cleanup(): number {
    let removed = 0
    const keysToRemove: string[] = []

    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i)
      if (key?.startsWith(this.prefix)) {
        const value = this.storage.getItem(key)
        if (value) {
          const entry = this.deserialize(value)
          if (!entry || isExpired(entry.timestamp, entry.ttl)) {
            keysToRemove.push(key)
          }
        }
      }
    }

    keysToRemove.forEach(key => {
      this.storage.removeItem(key)
      removed++
    })

    return removed
  }
}
