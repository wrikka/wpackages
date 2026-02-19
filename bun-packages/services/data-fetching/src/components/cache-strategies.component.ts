import type { CacheConfig } from '../types'

export class CacheStrategies {
  static shouldUseCache(strategy: CacheConfig['strategy'], hasData: boolean, isStale: boolean): boolean {
    switch (strategy) {
      case 'cache-first':
        return hasData
      case 'network-first':
        return !isStale
      case 'stale-while-revalidate':
        return hasData
      default:
        return false
    }
  }

  static shouldRefetch(strategy: CacheConfig['strategy'], hasData: boolean, isStale: boolean): boolean {
    switch (strategy) {
      case 'cache-first':
        return !hasData
      case 'network-first':
        return true
      case 'stale-while-revalidate':
        return isStale
      default:
        return true
    }
  }
}
