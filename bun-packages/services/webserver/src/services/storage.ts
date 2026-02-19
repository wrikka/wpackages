/**
 * Storage service - Functional approach
 */

import type {
  StorageConfig,
  StorageEntry
} from '../types'

// Storage state
type StorageState = {
  config: Required<StorageConfig>
  memoryStorage: Map<string, StorageEntry>
}

// Configuration merger
const mergeConfig = (config: StorageConfig): Required<StorageConfig> => ({
  type: config.type || 'memory',
  default: config.default,
  redis: config.redis,
  file: config.file ? {
    path: config.file.path,
    encryption: config.file.encryption || false
  } : undefined,
  database: config.database,
  s3: config.s3,
  hybrid: config.hybrid
})

// Initial state
export const createStorageState = (config: StorageConfig): StorageState => ({
  config: mergeConfig(config),
  memoryStorage: new Map()
})

// Pure functions for storage operations
export const get = <T = any>(
  state: StorageState,
  key: string,
  namespace?: string
): T | null => {
  const storageKey = generateKey(key, namespace)

  try {
    switch (state.config.type) {
      case 'redis':
        return getFromRedis<T>(storageKey)
      case 'database':
        return getFromDatabase<T>(storageKey)
      case 's3':
        return getFromS3<T>(storageKey)
      case 'hybrid':
        return getFromHybrid<T>(state, storageKey)
      case 'file':
        return getFromFile<T>(storageKey)
      case 'memory':
      default:
        return getFromMemory<T>(state, storageKey)
    }
  } catch (error) {
    console.error(`Storage get error for key ${key}:`, error)
    return null
  }
}

export const set = <T = any>(
  state: StorageState,
  key: string,
  value: T,
  namespace?: string
): StorageState => {
  const storageKey = generateKey(key, namespace)

  const entry: StorageEntry<T> = {
    key: storageKey,
    value,
    namespace,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    size: calculateSize(value)
  }

  try {
    switch (state.config.type) {
      case 'redis':
        setToRedis(storageKey, entry)
        break
      case 'database':
        setToDatabase(storageKey, entry)
        break
      case 's3':
        setToS3(storageKey, entry)
        break
      case 'hybrid':
        setToHybrid(state, storageKey, entry)
        break
      case 'file':
        setToFile(storageKey, entry)
        break
      case 'memory':
      default:
        setToMemory(state, storageKey, entry)
        break
    }
  } catch (error) {
    console.error(`Storage set error for key ${key}:`, error)
  }

  return state
}

export const deleteItem = (
  state: StorageState,
  key: string,
  namespace?: string
): StorageState => {
  const storageKey = generateKey(key, namespace)

  try {
    switch (state.config.type) {
      case 'redis':
        deleteFromRedis(storageKey)
        break
      case 'database':
        deleteFromDatabase(storageKey)
        break
      case 's3':
        deleteFromS3(storageKey)
        break
      case 'hybrid':
        deleteFromHybrid(state, storageKey)
        break
      case 'file':
        deleteFromFile(storageKey)
        break
      case 'memory':
      default:
        deleteFromMemory(state, storageKey)
        break
    }
  } catch (error) {
    console.error(`Storage delete error for key ${key}:`, error)
  }

  return state
}

export const exists = (
  state: StorageState,
  key: string,
  namespace?: string
): boolean => {
  const storageKey = generateKey(key, namespace)

  try {
    switch (state.config.type) {
      case 'redis':
        return existsInRedis(storageKey)
      case 'database':
        return existsInDatabase(storageKey)
      case 's3':
        return existsInS3(storageKey)
      case 'hybrid':
        return existsInHybrid(state, storageKey)
      case 'file':
        return existsInFile(storageKey)
      case 'memory':
      default:
        return existsInMemory(state, storageKey)
    }
  } catch (error) {
    console.error(`Storage exists error for key ${key}:`, error)
    return false
  }
}

export const list = (
  state: StorageState,
  namespace?: string,
  prefix?: string
): string[] => {
  try {
    switch (state.config.type) {
      case 'redis':
        return listFromRedis(namespace, prefix)
      case 'database':
        return listFromDatabase(namespace, prefix)
      case 's3':
        return listFromS3(namespace, prefix)
      case 'hybrid':
        return listFromHybrid(state, namespace, prefix)
      case 'file':
        return listFromFile(namespace, prefix)
      case 'memory':
      default:
        return listFromMemory(state, namespace, prefix)
    }
  } catch (error) {
    console.error('Storage list error:', error)
    return []
  }
}

export const clear = (
  state: StorageState,
  namespace?: string
): StorageState => {
  try {
    switch (state.config.type) {
      case 'redis':
        clearRedis(namespace)
        break
      case 'database':
        clearDatabase(namespace)
        break
      case 's3':
        clearS3(namespace)
        break
      case 'hybrid':
        clearHybrid(state, namespace)
        break
      case 'file':
        clearFile(namespace)
        break
      case 'memory':
      default:
        clearMemory(state, namespace)
        break
    }
  } catch (error) {
    console.error('Storage clear error:', error)
  }

  return state
}

// Helper functions
const generateKey = (key: string, namespace?: string): string => {
  if (namespace) {
    return `${namespace}:${key}`
  }
  return key
}

const calculateSize = (value: any): number => {
  return JSON.stringify(value).length
}

// Memory storage functions
const getFromMemory = <T>(state: StorageState, key: string): T | null => {
  const entry = state.memoryStorage.get(key)
  return entry ? (entry.value as T) : null
}

const setToMemory = <T>(state: StorageState, key: string, entry: StorageEntry<T>): void => {
  state.memoryStorage.set(key, entry)
}

const deleteFromMemory = <T>(state: StorageState, key: string): void => {
  state.memoryStorage.delete(key)
}

const existsInMemory = <T>(state: StorageState, key: string): boolean => {
  return state.memoryStorage.has(key)
}

const listFromMemory = <T>(state: StorageState, namespace?: string, prefix?: string): string[] => {
  const keys: string[] = []
  const searchPrefix = namespace ? `${namespace}:` : ''

  for (const key of state.memoryStorage.keys()) {
    if (key.startsWith(searchPrefix) && (!prefix || key.includes(prefix))) {
      keys.push(key)
    }
  }

  return keys
}

const clearMemory = <T>(state: StorageState, namespace?: string): void => {
  if (!namespace) {
    state.memoryStorage.clear()
    return
  }

  const prefix = `${namespace}:`
  for (const key of state.memoryStorage.keys()) {
    if (key.startsWith(prefix)) {
      state.memoryStorage.delete(key)
    }
  }
}

// Redis storage functions (mock implementations)
const getFromRedis = async <T>(key: string): Promise<T | null> => {
  console.log(`Getting ${key} from Redis`)
  return null
}

const setToRedis = async <T>(key: string, entry: StorageEntry<T>): Promise<void> => {
  console.log(`Setting ${key} to Redis`)
}

const deleteFromRedis = async (key: string): Promise<void> => {
  console.log(`Deleting ${key} from Redis`)
}

const existsInRedis = async (key: string): Promise<boolean> => {
  console.log(`Checking existence of ${key} in Redis`)
  return false
}

const listFromRedis = async (namespace?: string, prefix?: string): Promise<string[]> => {
  console.log(`Listing from Redis with namespace: ${namespace}, prefix: ${prefix}`)
  return []
}

const clearRedis = async (namespace?: string): Promise<void> => {
  console.log(`Clearing Redis with namespace: ${namespace}`)
}

// Database storage functions (mock implementations)
const getFromDatabase = async <T>(key: string): Promise<T | null> => {
  console.log(`Getting ${key} from database`)
  return null
}

const setToDatabase = async <T>(key: string, entry: StorageEntry<T>): Promise<void> => {
  console.log(`Setting ${key} to database`)
}

const deleteFromDatabase = async (key: string): Promise<void> => {
  console.log(`Deleting ${key} from database`)
}

const existsInDatabase = async (key: string): Promise<boolean> => {
  console.log(`Checking existence of ${key} in database`)
  return false
}

const listFromDatabase = async (namespace?: string, prefix?: string): Promise<string[]> => {
  console.log(`Listing from database with namespace: ${namespace}, prefix: ${prefix}`)
  return []
}

const clearDatabase = async (namespace?: string): Promise<void> => {
  console.log(`Clearing database with namespace: ${namespace}`)
}

// S3 storage functions (mock implementations)
const getFromS3 = async <T>(key: string): Promise<T | null> => {
  console.log(`Getting ${key} from S3`)
  return null
}

const setToS3 = async <T>(key: string, entry: StorageEntry<T>): Promise<void> => {
  console.log(`Setting ${key} to S3`)
}

const deleteFromS3 = async (key: string): Promise<void> => {
  console.log(`Deleting ${key} from S3`)
}

const existsInS3 = async (key: string): Promise<boolean> => {
  console.log(`Checking existence of ${key} in S3`)
  return false
}

const listFromS3 = async (namespace?: string, prefix?: string): Promise<string[]> => {
  console.log(`Listing from S3 with namespace: ${namespace}, prefix: ${prefix}`)
  return []
}

const clearS3 = async (namespace?: string): Promise<void> => {
  console.log(`Clearing S3 with namespace: ${namespace}`)
}

// File storage functions (mock implementations)
const getFromFile = async <T>(key: string): Promise<T | null> => {
  console.log(`Getting ${key} from file storage`)
  return null
}

const setToFile = async <T>(key: string, entry: StorageEntry<T>): Promise<void> => {
  console.log(`Setting ${key} to file storage`)
}

const deleteFromFile = async (key: string): Promise<void> => {
  console.log(`Deleting ${key} from file storage`)
}

const existsInFile = async (key: string): Promise<boolean> => {
  console.log(`Checking existence of ${key} in file storage`)
  return false
}

const listFromFile = async (namespace?: string, prefix?: string): Promise<string[]> => {
  console.log(`Listing from file storage with namespace: ${namespace}, prefix: ${prefix}`)
  return []
}

const clearFile = async (namespace?: string): Promise<void> => {
  console.log(`Clearing file storage with namespace: ${namespace}`)
}

// Hybrid storage functions
const getFromHybrid = async <T>(state: StorageState, key: string): Promise<T | null> => {
  // Try memory first
  let result = getFromMemory<T>(state, key)
  if (result !== null) {
    return result
  }

  // Try persistent storage
  result = await getFromRedis<T>(key)
  if (result !== null) {
    // Cache in memory for faster access
    const entry: StorageEntry<T> = {
      key,
      value: result,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      size: calculateSize(result)
    }
    setToMemory(state, key, entry)
    return result
  }

  return null
}

const setToHybrid = async <T>(state: StorageState, key: string, entry: StorageEntry<T>): Promise<void> => {
  // Set in memory
  setToMemory(state, key, entry)

  // Set in persistent storage
  await setToRedis(key, entry)
}

const deleteFromHybrid = async <T>(state: StorageState, key: string): Promise<void> => {
  deleteFromMemory(state, key)
  await deleteFromRedis(key)
}

const existsInHybrid = async (state: StorageState, key: string): Promise<boolean> => {
  return existsInMemory(state, key) || await existsInRedis(key)
}

const listFromHybrid = async (state: StorageState, namespace?: string, prefix?: string): Promise<string[]> => {
  const memoryKeys = listFromMemory(state, namespace, prefix)
  const redisKeys = await listFromRedis(namespace, prefix)

  // Merge and deduplicate
  return [...new Set([...memoryKeys, ...redisKeys])]
}

const clearHybrid = async (state: StorageState, namespace?: string): Promise<void> => {
  clearMemory(state, namespace)
  await clearRedis(namespace)
}

// Storage factory
export const createStorage = (config: StorageConfig): StorageState => createStorageState(config)

// Storage utilities
export const getStats = (state: StorageState) => {
  const stats: Record<string, any> = {
    type: state.config.type
  }

  if (state.config.type === 'memory' || state.config.type === 'hybrid') {
    stats.memory = {
      size: state.memoryStorage.size
    }
  }

  return stats
}

export const ping = async (state: StorageState): Promise<void> => {
  // Health check for storage
  switch (state.config.type) {
    case 'redis':
      // Redis ping implementation
      break
    case 'database':
      // Database ping implementation
      break
    case 's3':
      // S3 ping implementation
      break
    case 'hybrid':
      // Multiple health checks
      break
    case 'file':
      // File system check
      break
    case 'memory':
    default:
      // Memory storage is always available
      break
  }
}
