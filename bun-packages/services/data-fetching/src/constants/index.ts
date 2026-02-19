export const DEFAULT_CONFIG = {
  timeout: 10000,
  retries: 3,
  retryDelay: 1000,
  cache: {
    ttl: 300000, // 5 minutes
    maxSize: 100,
    storage: 'memory' as const,
    strategy: 'stale-while-revalidate' as const
  }
} as const

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
} as const

export const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
} as const

export const STORAGE_TYPES = {
  MEMORY: 'memory',
  LOCAL_STORAGE: 'localStorage',
  INDEXED_DB: 'indexedDB'
} as const
