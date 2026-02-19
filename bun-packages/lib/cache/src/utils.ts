/**
 * Cache utilities
 */

import type { CacheEntry } from './types'

/**
 * Check if cache entry is expired
 */
export function isCacheEntryExpired<TData>(entry: CacheEntry<TData>): boolean {
  return Date.now() - entry.timestamp > entry.ttl
}

/**
 * Generate cache key from query parameters
 */
export function generateCacheKey(prefix: string, params: Record<string, unknown>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${String(params[key])}`)
    .join('|')
  
  return `${prefix}:${sortedParams}`
}

/**
 * Create cache entry with timestamp
 */
export function createCacheEntry<TData>(
  data: TData,
  ttl: number,
  queryKey: readonly unknown[]
): CacheEntry<TData> {
  return {
    data,
    timestamp: Date.now(),
    ttl,
    queryKey
  }
}

/**
 * Default TTL values (in milliseconds)
 */
export const DEFAULT_TTL = {
  SHORT: 5 * 60 * 1000,      // 5 minutes
  MEDIUM: 30 * 60 * 1000,    // 30 minutes
  LONG: 2 * 60 * 60 * 1000,  // 2 hours
  DAY: 24 * 60 * 60 * 1000   // 24 hours
} as const
