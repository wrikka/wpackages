/**
 * Cache service - Functional approach
 */

import type { 
  CacheConfig, 
  CacheEntry, 
  CacheOptions 
} from '../types'
import { createCacheKey, isExpired } from '../lib/core'

// Cache state
type CacheState = {
  memory: Map<string, CacheEntry>
  config: CacheConfig
  lastCleanup: number
}

// Initial state
export const createCacheState = (config: CacheConfig): CacheState => ({
  memory: new Map(),
  config,
  lastCleanup: Date.now()
})

// Pure functions for cache operations
export const get = <T = any>(
  state: CacheState,
  key: string,
  options?: CacheOptions
): T | null => {
  const cacheKey = createCacheKey(key, options)
  const entry = state.memory.get(cacheKey)
  
  if (!entry) {
    return null
  }
  
  if (isExpired(entry.expires)) {
    return null
  }
  
  // Update access statistics
  entry.hits++
  entry.lastAccessed = Date.now()
  
  return entry.value as T
}

export const set = <T = any>(
  state: CacheState,
  key: string,
  value: T,
  options?: CacheOptions
): CacheState => {
  const cacheKey = createCacheKey(key, options)
  const ttl = options?.ttl || state.config.ttl
  const expires = Date.now() + ttl
  
  const entry: CacheEntry<T> = {
    key: cacheKey,
    value,
    expires,
    hits: 0,
    createdAt: Date.now(),
    lastAccessed: Date.now(),
    size: JSON.stringify(value).length,
    tags: options?.tags,
    compressed: options?.compression || false,
    encrypted: options?.encryption || false
  }
  
  const newMemory = new Map(state.memory)
  
  // Check memory limit
  if (state.config.maxSize && newMemory.size >= state.config.maxSize) {
    evictLRU(newMemory)
  }
  
  newMemory.set(cacheKey, entry)
  
  return {
    ...state,
    memory: newMemory
  }
}

export const del = (
  state: CacheState,
  key: string,
  options?: CacheOptions
): CacheState => {
  const cacheKey = createCacheKey(key, options)
  const newMemory = new Map(state.memory)
  newMemory.delete(cacheKey)
  
  return {
    ...state,
    memory: newMemory
  }
}

export const clear = (state: CacheState): CacheState => ({
  ...state,
  memory: new Map()
})

export const cleanup = (state: CacheState): CacheState => {
  const now = Date.now()
  const newMemory = new Map<string, CacheEntry>()
  
  for (const [key, entry] of state.memory.entries()) {
    if (!isExpired(entry.expires)) {
      newMemory.set(key, entry)
    }
  }
  
  return {
    ...state,
    memory: newMemory,
    lastCleanup: now
  }
}

export const invalidateByTag = (
  state: CacheState,
  tag: string
): CacheState => {
  const newMemory = new Map<string, CacheEntry>()
  
  for (const [key, entry] of state.memory.entries()) {
    if (!entry.tags || !entry.tags.includes(tag)) {
      newMemory.set(key, entry)
    }
  }
  
  return {
    ...state,
    memory: newMemory
  }
}

// Cache utilities
const evictLRU = (memory: Map<string, CacheEntry>): void => {
  let oldestKey: string | null = null
  let oldestTime = Date.now()
  
  for (const [key, entry] of memory.entries()) {
    if (entry.lastAccessed < oldestTime) {
      oldestTime = entry.lastAccessed
      oldestKey = key
    }
  }
  
  if (oldestKey) {
    memory.delete(oldestKey)
  }
}

export const getStats = (state: CacheState) => {
  const entries = Array.from(state.memory.values())
  const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0)
  const totalHits = entries.reduce((sum, entry) => sum + entry.hits, 0)
  const expiredCount = entries.filter(entry => isExpired(entry.expires)).length
  
  return {
    type: state.config.type,
    ttl: state.config.ttl,
    size: state.memory.size,
    maxSize: state.config.maxSize,
    totalSize,
    totalHits,
    expiredCount,
    lastCleanup: state.lastCleanup
  }
}

export const shouldCleanup = (state: CacheState, interval: number = 60000): boolean => {
  return Date.now() - state.lastCleanup > interval
}

// Cache factory
export const createCache = (config: CacheConfig): CacheState => createCacheState(config)

// Advanced cache operations
export const getMultiple = <T = any>(
  state: CacheState,
  keys: string[],
  options?: CacheOptions
): (T | null)[] => {
  return keys.map(key => get<T>(state, key, options))
}

export const setMultiple = <T = any>(
  state: CacheState,
  entries: Array<{ key: string; value: T; options?: CacheOptions }>
): CacheState => {
  return entries.reduce((currentState, { key, value, options }) => {
    return set(currentState, key, value, options)
  }, state)
}

export const getOrSet = <T = any>(
  state: CacheState,
  key: string,
  factory: () => T | Promise<T>,
  options?: CacheOptions
): Promise<{ state: CacheState; value: T }> => {
  const existing = get<T>(state, key, options)
  
  if (existing !== null) {
    return Promise.resolve({ state, value: existing })
  }
  
  return Promise.resolve(factory()).then(value => ({
    state: set(state, key, value, options),
    value
  }))
}

// Cache warming
export const warm = <T = any>(
  state: CacheState,
  entries: Array<{ key: string; value: T; options?: CacheOptions }>
): CacheState => {
  return setMultiple(state, entries)
}

// Cache export/import
export const exportCache = (state: CacheState): Array<CacheEntry> => {
  return Array.from(state.memory.values())
}

export const importCache = (
  state: CacheState,
  entries: Array<CacheEntry>
): CacheState => {
  const newMemory = new Map<string, CacheEntry>()
  
  for (const entry of entries) {
    if (!isExpired(entry.expires)) {
      newMemory.set(entry.key, entry)
    }
  }
  
  return {
    ...state,
    memory: newMemory
  }
}

// Cache analytics
export const getAnalytics = (state: CacheState) => {
  const entries = Array.from(state.memory.values())
  const now = Date.now()
  
  const ageDistribution = entries.reduce((dist, entry) => {
    const age = now - entry.createdAt
    const ageGroup = age < 60000 ? '0-1m' : 
                    age < 3600000 ? '1-60m' : 
                    age < 86400000 ? '1-24h' : '>24h'
    
    dist[ageGroup] = (dist[ageGroup] || 0) + 1
    return dist
  }, {} as Record<string, number>)
  
  const hitRateDistribution = entries.reduce((dist, entry) => {
    const hitRate = entry.hits
    const hitGroup = hitRate === 0 ? '0' : 
                    hitRate < 10 ? '1-9' : 
                    hitRate < 100 ? '10-99' : '100+'
    
    dist[hitGroup] = (dist[hitGroup] || 0) + 1
    return dist
  }, {} as Record<string, number>)
  
  const tagDistribution = entries.reduce((dist, entry) => {
    if (entry.tags) {
      for (const tag of entry.tags) {
        dist[tag] = (dist[tag] || 0) + 1
      }
    }
    return dist
  }, {} as Record<string, number>)
  
  return {
    totalEntries: entries.length,
    ageDistribution,
    hitRateDistribution,
    tagDistribution,
    averageHits: entries.length > 0 ? entries.reduce((sum, e) => sum + e.hits, 0) / entries.length : 0,
    oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => e.createdAt)) : null,
    newestEntry: entries.length > 0 ? Math.max(...entries.map(e => e.createdAt)) : null
  }
}
