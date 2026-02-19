/**
 * WebServer framework - Functional approach
 * High-performance TypeScript web server framework built to surpass Nitro
 */

// Core exports
export type {
  Request,
  Response,
  RouteHandler,
  MiddlewareFunction,
  ServerConfig,
  CacheConfig,
  StorageConfig,
  SecurityConfig,
  PerformanceMetrics,
  HealthCheck
} from './types'

// Utility exports
export {
  createRequestId,
  parseUrl,
  getClientIp,
  getUserAgent,
  isEmail,
  isUrl,
  isUuid,
  isSlug,
  hashPassword,
  comparePassword,
  generateApiKey,
  sanitizeString,
  detectSqlInjection,
  detectXss,
  createTimer,
  debounce,
  throttle,
  createError,
  createSuccessResponse,
  createErrorResponse
} from './utils'

// Core library exports
export {
  createRequest,
  createResponse,
  createRoute,
  matchRoute,
  composeMiddleware,
  applyMiddleware,
  validateRequest,
  validateResponse
} from './lib/core'

// Service exports
export {
  createRouterState,
  addRoute,
  findRoute,
  handleRequest,
  get,
  post,
  put,
  del,
  group,
  getRouteStats
} from './services/router'

export {
  createCacheState,
  get as getCache,
  set as setCache,
  del as deleteCache,
  clear,
  cleanup,
  getStats as getCacheStats,
  getOrSet
} from './services/cache'

// Application exports
export {
  createServerState,
  createServer,
  startServer,
  stopServer,
  getMetrics,
  getHealth
} from './app/server'

// Web application exports
export {
  createWebApp,
  exampleApp
} from './web'

// Constants exports
export {
  HTTP_METHODS,
  HTTP_STATUS,
  CONTENT_TYPES,
  CACHE_DURATIONS,
  RATE_LIMITS,
  SECURITY_HEADERS,
  LOG_LEVELS,
  ERROR_CODES,
  DEFAULT_CONFIG,
  FILE_PATTERNS,
  REGEX_PATTERNS,
  MEMORY_SIZES,
  TIME_UNITS,
  ENV_VARS
} from './constants'

// Default export for convenience
export default {
  createWebApp,
  createServer,
  utils: {
    createRequestId,
    parseUrl,
    getClientIp,
    getUserAgent,
    isEmail,
    isUrl,
    isUuid,
    isSlug,
    hashPassword,
    comparePassword,
    generateApiKey,
    sanitizeString,
    detectSqlInjection,
    detectXss,
    createTimer,
    debounce,
    throttle,
    createError,
    createSuccessResponse,
    createErrorResponse
  },
  constants: {
    HTTP_METHODS,
    HTTP_STATUS,
    CONTENT_TYPES,
    CACHE_DURATIONS,
    RATE_LIMITS,
    SECURITY_HEADERS,
    LOG_LEVELS,
    ERROR_CODES,
    DEFAULT_CONFIG,
    FILE_PATTERNS,
    REGEX_PATTERNS,
    MEMORY_SIZES,
    TIME_UNITS,
    ENV_VARS
  }
}
