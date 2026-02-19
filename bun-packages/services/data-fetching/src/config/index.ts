// Configuration files (import types only)

import type { CacheConfig } from '../types'

export const defaultConfig: CacheConfig = {
  ttl: 300000, // 5 minutes
  maxSize: 100,
  storage: 'memory',
  strategy: 'stale-while-revalidate'
}

export const developmentConfig: CacheConfig = {
  ...defaultConfig,
  ttl: 60000 // 1 minute for development
}

export const productionConfig: CacheConfig = {
  ...defaultConfig,
  ttl: 600000 // 10 minutes for production
}

export const getConfig = (): CacheConfig => {
  const env = process.env.NODE_ENV || 'development'
  
  switch (env) {
    case 'production':
      return productionConfig
    case 'development':
      return developmentConfig
    default:
      return defaultConfig
  }
}
