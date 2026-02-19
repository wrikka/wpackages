/**
 * Constants for WebServer framework
 */

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  OPTIONS: 'OPTIONS',
  HEAD: 'HEAD'
} as const

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
} as const

// Content Types
export const CONTENT_TYPES = {
  JSON: 'application/json',
  HTML: 'text/html',
  TEXT: 'text/plain',
  XML: 'application/xml',
  FORM: 'application/x-www-form-urlencoded',
  MULTIPART: 'multipart/form-data'
} as const

// Cache Durations (in milliseconds)
export const CACHE_DURATIONS = {
  MINUTE: 60 * 1000,
  FIVE_MINUTES: 5 * 60 * 1000,
  FIFTEEN_MINUTES: 15 * 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000
} as const

// Rate Limits
export const RATE_LIMITS = {
  DEFAULT_WINDOW: 60 * 1000, // 1 minute
  DEFAULT_MAX: 100, // 100 requests per minute
  STRICT_WINDOW: 60 * 1000, // 1 minute
  STRICT_MAX: 10, // 10 requests per minute
  LOOSE_WINDOW: 60 * 1000, // 1 minute
  LOOSE_MAX: 1000 // 1000 requests per minute
} as const

// Security Headers
export const SECURITY_HEADERS = {
  XSS_PROTECTION: '1; mode=block',
  CONTENT_TYPE_OPTIONS: 'nosniff',
  FRAME_OPTIONS: 'DENY',
  REFERRER_POLICY: 'strict-origin-when-cross-origin'
} as const

// Log Levels
export const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4
} as const

// Error Codes
export const ERROR_CODES = {
  VALIDATION_FAILED: 'ERR_VALIDATION_FAILED',
  UNAUTHORIZED: 'ERR_UNAUTHORIZED',
  FORBIDDEN: 'ERR_FORBIDDEN',
  NOT_FOUND: 'ERR_NOT_FOUND',
  CONFLICT: 'ERR_CONFLICT',
  RATE_LIMIT_EXCEEDED: 'ERR_RATE_LIMIT_EXCEEDED',
  USER_RATE_LIMIT_EXCEEDED: 'ERR_USER_RATE_LIMIT_EXCEEDED',
  CSRF_TOKEN_INVALID: 'ERR_CSRF_TOKEN_INVALID',
  SQL_INJECTION_DETECTED: 'ERR_SQL_INJECTION_DETECTED',
  XSS_DETECTED: 'ERR_XSS_DETECTED',
  MISSING_TOKEN: 'ERR_MISSING_TOKEN',
  INVALID_TOKEN: 'ERR_INVALID_TOKEN',
  MISSING_CREDENTIALS: 'ERR_MISSING_CREDENTIALS',
  INVALID_CREDENTIALS: 'ERR_INVALID_CREDENTIALS',
  PAYLOAD_TOO_LARGE: 'ERR_PAYLOAD_TOO_LARGE',
  INVALID_BODY: 'ERR_INVALID_BODY',
  INTERNAL_SERVER_ERROR: 'ERR_INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'ERR_SERVICE_UNAVAILABLE'
} as const

// Default Configuration
export const DEFAULT_CONFIG = {
  PORT: 3000,
  HOST: '0.0.0.0',
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  MAX_REQUEST_SIZE: '10mb',
  REQUEST_TIMEOUT: 30000, // 30 seconds
  KEEP_ALIVE_TIMEOUT: 5000, // 5 seconds
  MAX_CONNECTIONS: 1000,
  HEALTH_CHECK_INTERVAL: 30000, // 30 seconds
  METRICS_COLLECTION_INTERVAL: 5000, // 5 seconds
  LOG_ROTATION_INTERVAL: 24 * 60 * 60 * 1000 // 24 hours
} as const

// File Patterns
export const FILE_PATTERNS = {
  ROUTE_FILES: /\.(get|post|put|patch|delete|options|head)\.(ts|js)$/,
  INDEX_FILES: /^index\.(ts|js)$/,
  PARAM_FILES: /\[.*?\]\.(ts|js)$/,
  CONFIG_FILES: /\.(config|conf)\.(ts|js|json)$/,
  TEST_FILES: /\.(test|spec)\.(ts|js)$/
} as const

// Regular Expressions
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/.+/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  SLUG: /^[a-z0-9-]+$/,
  API_KEY: /^[a-zA-Z0-9_-]{32,}$/,
  SQL_INJECTION: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b|--|\*\/|\/\*|;|'|\"|`|(\b(OR|AND)\s+\d+\s*=\s*\d+)|(\b(OR|AND)\s+['"].*['"]\s*=\s*['"].*['"]))/i,
  XSS: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>|<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>|<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>|<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi
} as const

// Memory Sizes (in bytes)
export const MEMORY_SIZES = {
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024
} as const

// Time Units (in milliseconds)
export const TIME_UNITS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000
} as const

// Environment Variables
export const ENV_VARS = {
  NODE_ENV: 'NODE_ENV',
  PORT: 'PORT',
  HOST: 'HOST',
  LOG_LEVEL: 'LOG_LEVEL',
  REDIS_HOST: 'REDIS_HOST',
  REDIS_PORT: 'REDIS_PORT',
  REDIS_PASSWORD: 'REDIS_PASSWORD',
  JWT_SECRET: 'JWT_SECRET',
  DATABASE_URL: 'DATABASE_URL',
  S3_BUCKET: 'S3_BUCKET',
  S3_REGION: 'S3_REGION',
  S3_ACCESS_KEY_ID: 'S3_ACCESS_KEY_ID',
  S3_SECRET_ACCESS_KEY: 'S3_SECRET_ACCESS_KEY'
} as const
