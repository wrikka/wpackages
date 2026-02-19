/**
 * Universal cache library exports
 */

// Types
export type { CacheEntry, CacheConfig, CacheRepository } from './types'

// Utilities
export { 
  isCacheEntryExpired, 
  generateCacheKey, 
  createCacheEntry,
  DEFAULT_TTL 
} from './utils'

// Memory cache
export { MemoryCache } from './memory'

// Storage cache
export { StorageCache } from './storage'
