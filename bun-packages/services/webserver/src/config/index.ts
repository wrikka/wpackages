/**
 * Configuration module for WebServer framework
 */

export interface WebServerConfig {
  port?: number
  host?: string
  cors?: boolean | CorsConfig
  rateLimit?: RateLimitConfig
  cache?: CacheConfig
  security?: SecurityConfig
  logging?: LoggingConfig
  metrics?: MetricsConfig
}

export interface CorsConfig {
  origin?: string | string[] | boolean
  methods?: string[]
  allowedHeaders?: string[]
  exposedHeaders?: string[]
  credentials?: boolean
  maxAge?: number
  preflightContinue?: boolean
  optionsSuccessStatus?: number
}

export interface RateLimitConfig {
  windowMs: number
  max: number
  message?: string
  standardHeaders?: boolean
  legacyHeaders?: boolean
  keyGenerator?: (req: any) => string
  skip?: (req: any) => boolean
}

export interface CacheConfig {
  enabled?: boolean
  ttl?: number
  maxSize?: number
  strategy?: 'memory' | 'redis' | 'file'
  redis?: {
    host: string
    port: number
    password?: string
    db?: number
  }
}

export interface SecurityConfig {
  helmet?: boolean | HelmetConfig
  csrf?: boolean | CsrfConfig
  validation?: ValidationConfig
}

export interface HelmetConfig {
  contentSecurityPolicy?: boolean | Record<string, any>
  crossOriginEmbedderPolicy?: boolean
  crossOriginOpenerPolicy?: boolean
  crossOriginResourcePolicy?: boolean
  dnsPrefetchControl?: boolean
  frameguard?: boolean | { action: 'deny' | 'sameorigin' | 'allow-from' }
  hidePoweredBy?: boolean
  hsts?: boolean | { maxAge: number; includeSubDomains?: boolean; preload?: boolean }
  ieNoOpen?: boolean
  noSniff?: boolean
  originAgentCluster?: boolean
  permittedCrossDomainPolicies?: boolean
  referrerPolicy?: boolean | { policy: string }
  xssFilter?: boolean
}

export interface CsrfConfig {
  cookie?: boolean | { key: string; options?: any }
  ignoreMethods?: string[]
  value?: (req: any) => string
}

export interface ValidationConfig {
  body?: boolean
  params?: boolean
  query?: boolean
  headers?: boolean
  sanitize?: boolean
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal'
  format?: 'json' | 'text'
  enabled?: boolean
  requests?: boolean
  responses?: boolean
  errors?: boolean
  performance?: boolean
}

export interface MetricsConfig {
  enabled?: boolean
  collectDefaultMetrics?: boolean
  requestDuration?: boolean
  requestCount?: boolean
  errorRate?: boolean
  memoryUsage?: boolean
  cpuUsage?: boolean
}

export const defaultConfig: WebServerConfig = {
  port: 3000,
  host: '0.0.0.0',
  cors: true,
  rateLimit: {
    windowMs: 60000, // 1 minute
    max: 100,
    standardHeaders: true,
    legacyHeaders: false
  },
  cache: {
    enabled: true,
    ttl: 300000, // 5 minutes
    maxSize: 1000,
    strategy: 'memory'
  },
  security: {
    helmet: true,
    csrf: false,
    validation: {
      body: true,
      params: true,
      query: true,
      headers: false,
      sanitize: true
    }
  },
  logging: {
    level: 'info',
    format: 'json',
    enabled: true,
    requests: true,
    responses: true,
    errors: true,
    performance: true
  },
  metrics: {
    enabled: true,
    collectDefaultMetrics: true,
    requestDuration: true,
    requestCount: true,
    errorRate: true,
    memoryUsage: true,
    cpuUsage: false
  }
}

export const createConfig = (userConfig: Partial<WebServerConfig> = {}): WebServerConfig => {
  return mergeConfig(defaultConfig, userConfig)
}

export const mergeConfig = (base: WebServerConfig, override: Partial<WebServerConfig>): WebServerConfig => {
  return {
    ...base,
    ...override,
    cors: mergeDeep(base.cors, override.cors),
    rateLimit: mergeDeep(base.rateLimit, override.rateLimit),
    cache: mergeDeep(base.cache, override.cache),
    security: mergeDeep(base.security, override.security),
    logging: mergeDeep(base.logging, override.logging),
    metrics: mergeDeep(base.metrics, override.metrics)
  }
}

export const validateConfig = (config: WebServerConfig): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (config.port && (config.port < 1 || config.port > 65535)) {
    errors.push('Port must be between 1 and 65535')
  }

  if (config.rateLimit?.windowMs && config.rateLimit.windowMs < 1000) {
    errors.push('Rate limit window must be at least 1000ms')
  }

  if (config.rateLimit?.max && config.rateLimit.max < 1) {
    errors.push('Rate limit max must be at least 1')
  }

  if (config.cache?.ttl && config.cache.ttl < 1000) {
    errors.push('Cache TTL must be at least 1000ms')
  }

  if (config.cache?.maxSize && config.cache.maxSize < 1) {
    errors.push('Cache max size must be at least 1')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// Deep merge utility
function mergeDeep<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target }

  for (const key in source) {
    const sourceValue = source[key]
    const targetValue = result[key]

    if (sourceValue === undefined) continue

    if (
      sourceValue !== null &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue !== null &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      result[key] = mergeDeep(targetValue, sourceValue)
    } else {
      result[key] = sourceValue as any
    }
  }

  return result
}
