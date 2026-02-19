/**
 * Storage cache implementation (localStorage/IndexedDB)
 */

import type { CacheRepository, CacheEntry } from '../types'
import { isCacheEntryExpired } from '../utils'

export class StorageCache<TData = unknown> implements CacheRepository<TData> {
  private prefix: string
  private storage: 'localStorage' | 'indexedDB'

  constructor(prefix = 'cache-', storage: 'localStorage' | 'indexedDB' = 'localStorage') {
    this.prefix = prefix
    this.storage = storage
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`
  }

  async get(key: string): Promise<TData | null> {
    if (this.storage === 'localStorage') {
      return this.getFromLocalStorage(key)
    }
    return this.getFromIndexedDB(key)
  }

  async set(key: string, data: TData, ttl = 300000): Promise<void> {
    if (this.storage === 'localStorage') {
      await this.setToLocalStorage(key, data, ttl)
    } else {
      await this.setToIndexedDB(key, data, ttl)
    }
  }

  async delete(key: string): Promise<boolean> {
    if (this.storage === 'localStorage') {
      return this.deleteFromLocalStorage(key)
    }
    return this.deleteFromIndexedDB(key)
  }

  async clear(): Promise<void> {
    if (this.storage === 'localStorage') {
      this.clearLocalStorage()
    } else {
      await this.clearIndexedDB()
    }
  }

  async has(key: string): Promise<boolean> {
    const entry = await this.getEntry(key)
    return entry !== null
  }

  async getEntry(key: string): Promise<CacheEntry<TData> | null> {
    if (this.storage === 'localStorage') {
      return this.getEntryFromLocalStorage(key)
    }
    return this.getEntryFromIndexedDB(key)
  }

  // localStorage methods
  private async getFromLocalStorage(key: string): Promise<TData | null> {
    try {
      const item = localStorage.getItem(this.getKey(key))
      if (!item) return null

      const entry: CacheEntry<TData> = JSON.parse(item)
      if (isCacheEntryExpired(entry)) {
        localStorage.removeItem(this.getKey(key))
        return null
      }

      return entry.data
    } catch {
      return null
    }
  }

  private async setToLocalStorage(key: string, data: TData, ttl: number): Promise<void> {
    const entry: CacheEntry<TData> = {
      data,
      timestamp: Date.now(),
      ttl,
      queryKey: [key]
    }

    localStorage.setItem(this.getKey(key), JSON.stringify(entry))
  }

  private deleteFromLocalStorage(key: string): boolean {
    localStorage.removeItem(this.getKey(key))
    return true
  }

  private clearLocalStorage(): void {
    const keys = Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
    
    keys.forEach(key => localStorage.removeItem(key))
  }

  private async getEntryFromLocalStorage(key: string): Promise<CacheEntry<TData> | null> {
    try {
      const item = localStorage.getItem(this.getKey(key))
      if (!item) return null

      const entry: CacheEntry<TData> = JSON.parse(item)
      if (isCacheEntryExpired(entry)) {
        localStorage.removeItem(this.getKey(key))
        return null
      }

      return entry
    } catch {
      return null
    }
  }

  // IndexedDB methods (simplified implementation)
  private async getFromIndexedDB(_key: string): Promise<TData | null> {
    // TODO: Implement IndexedDB operations
    console.warn('IndexedDB not implemented yet')
    return null
  }

  private async setToIndexedDB(_key: string, _data: TData, _ttl: number): Promise<void> {
    // TODO: Implement IndexedDB operations
    console.warn('IndexedDB not implemented yet')
  }

  private async deleteFromIndexedDB(_key: string): Promise<boolean> {
    // TODO: Implement IndexedDB operations
    console.warn('IndexedDB not implemented yet')
    return false
  }

  private async clearIndexedDB(): Promise<void> {
    // TODO: Implement IndexedDB operations
    console.warn('IndexedDB not implemented yet')
  }

  private async getEntryFromIndexedDB(_key: string): Promise<CacheEntry<TData> | null> {
    // TODO: Implement IndexedDB operations
    console.warn('IndexedDB not implemented yet')
    return null
  }
}
