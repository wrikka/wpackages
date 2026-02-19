/**
 * Repository utilities
 * Helper functions and utilities for repository operations
 */

import type { CacheEntry } from '../types'

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
 * Check if cache entry is expired
 */
export function isCacheEntryExpired<TData>(entry: CacheEntry<TData>): boolean {
  return Date.now() - entry.timestamp > entry.ttl
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
 * Retry repository operation with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error

      if (attempt === maxRetries) {
        throw lastError
      }

      const delay = baseDelay * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}
