/**
 * Utility functions for WebServer framework
 */

import { createHash, randomBytes, timingSafeEqual } from 'crypto'
import { performance } from 'perf_hooks'

// Request utilities
export const createRequestId = (): string => randomBytes(16).toString('hex')

export const parseUrl = (url: string): { pathname: string; query: Record<string, string> } => {
  const parsed = new URL(url)
  const query: Record<string, string> = {}

  parsed.searchParams.forEach((value, key) => {
    query[key] = value
  })

  return {
    pathname: parsed.pathname,
    query
  }
}

export const getClientIp = (req: any): string => {
  return req.headers['x-forwarded-for'] ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown'
}

export const getUserAgent = (req: any): string => {
  return req.headers['user-agent'] || 'unknown'
}

// Validation utilities
export const isEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isUrl = (url: string): boolean => {
  const urlRegex = /^https?:\/\/.+/
  return urlRegex.test(url)
}

export const isUuid = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

export const isSlug = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9-]+$/
  return slugRegex.test(slug)
}

// Security utilities
export const hashPassword = (password: string): string => {
  return createHash('sha256').update(password).digest('hex')
}

export const comparePassword = (password: string, hash: string): boolean => {
  const passwordHash = createHash('sha256').update(password).digest('hex')
  return timingSafeEqual(Buffer.from(passwordHash), Buffer.from(hash))
}

export const generateApiKey = (): string => {
  return randomBytes(32).toString('hex')
}

export const generateCsrfToken = (): string => {
  return randomBytes(32).toString('hex')
}

export const validateCsrfToken = (token1: string, token2: string): boolean => {
  return timingSafeEqual(Buffer.from(token1), Buffer.from(token2))
}

export const sanitizeString = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

export const detectSqlInjection = (input: string): boolean => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(--|\*\/|\/\*|;|'|"|`)/,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(\b(OR|AND)\s+['"].*['"]\s*=\s*['"].*['"])/i
  ]

  return sqlPatterns.some(pattern => pattern.test(input))
}

export const detectXss = (input: string): boolean => {
  const xssPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>|<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>|<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>|<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi
  return xssPattern.test(input)
}

// Performance utilities
export const createTimer = (): { start: number; end: () => number } => {
  const start = performance.now()
  return {
    start,
    end: () => performance.now() - start
  }
}

export const measureAsync = async <T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> => {
  const timer = createTimer()
  const result = await fn()
  const duration = timer.end()
  return { result, duration }
}

export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void => {
  let timeoutId: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

export const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void => {
  let inThrottle = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Cache utilities
export const generateCacheKey = (key: string, options?: { vary?: string[] }): string => {
  if (!options?.vary || options.vary.length === 0) {
    return key
  }

  const varyData = options.vary.join('|')
  const hash = createHash('md5').update(varyData).digest('hex')
  return `${key}:${hash}`
}

export const isExpired = (expires: number): boolean => Date.now() > expires

export const parseSize = (size: string): number => {
  const units: Record<string, number> = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024
  }

  const match = size.toLowerCase().match(/^(\d+)(b|kb|mb|gb)$/)
  if (!match) {
    return 10 * 1024 * 1024 // Default 10MB
  }

  const [, value, unit] = match
  return parseInt(value) * (units[unit] || 1)
}

// Error utilities
export const createError = (
  code: string,
  message: string,
  statusCode: number = 500,
  details?: any
): Error & { code: string; statusCode: number; details?: any } => {
  const error = new Error(message) as any
  error.code = code
  error.statusCode = statusCode
  error.details = details
  return error
}

export const isHttpError = (error: any): boolean => {
  return error && typeof error.statusCode === 'number'
}

// Response utilities
export const createSuccessResponse = <T>(
  data: T,
  meta?: { pagination?: any; timestamp?: string; requestId?: string; version?: string }
) => ({
  success: true,
  data,
  meta: {
    timestamp: new Date().toISOString(),
    ...meta
  }
})

export const createErrorResponse = (
  code: string,
  message: string,
  requestId?: string,
  details?: any
) => ({
  error: {
    code,
    message,
    details,
    timestamp: new Date().toISOString(),
    requestId: requestId || 'unknown'
  }
})

// Array utilities
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

export const unique = <T>(array: T[]): T[] => [...new Set(array)]

export const groupBy = <T, K extends keyof any>(array: T[], key: (item: T) => K): Record<K, T[]> => {
  return array.reduce((groups, item) => {
    const groupKey = key(item)
    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(item)
    return groups
  }, {} as Record<K, T[]>)
}

// Object utilities
export const omit = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj }
  keys.forEach(key => delete result[key])
  return result
}

export const pick = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T
  }

  if (typeof obj === 'object') {
    const cloned = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }

  return obj
}

// String utilities
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const camelCase = (str: string): string => {
  return str.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
}

export const kebabCase = (str: string): string => {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase()
}

export const snakeCase = (str: string): string => {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase()
}

export const truncate = (str: string, length: number, suffix: string = '...'): string => {
  if (str.length <= length) {
    return str
  }
  return str.slice(0, length - suffix.length) + suffix
}
