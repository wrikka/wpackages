/**
 * Core library functions for WebServer framework
 */

import type {
  Request,
  Response,
  RouteHandler,
  MiddlewareFunction,
  RouteMatch,
  RouteMap,
  MiddlewareChain
} from '../types'

// Pure functions for request processing
export const createRequest = (
  id: string,
  method: string,
  url: string,
  headers: Record<string, string>,
  body?: any,
  query?: Record<string, string>,
  params?: Record<string, string>
): Request => ({
  id,
  method,
  url,
  path: new URL(url).pathname,
  protocol: new URL(url).protocol,
  hostname: new URL(url).hostname,
  headers,
  body,
  query: query || {},
  params: params || {},
  startTime: performance.now()
})

export const createResponse = (
  status: number = 200,
  headers: Record<string, string> = {},
  body?: any
): Response => ({
  status,
  headers: {
    'content-type': 'application/json',
    ...headers
  },
  body,
  sent: false,
  startTime: performance.now()
})

export const updateResponse = (
  response: Response,
  updates: Partial<Response>
): Response => ({
  ...response,
  ...updates,
  headers: {
    ...response.headers,
    ...updates.headers
  }
})

// Pure functions for routing
export const createRoute = (
  method: string,
  path: string,
  handler: RouteHandler,
  middleware: MiddlewareChain = [],
  priority: number = 0
) => ({
  method,
  path,
  handler,
  middleware,
  priority
})

export const matchRoute = (
  routes: Route[],
  method: string,
  path: string
): RouteMatch | null => {
  const sortedRoutes = [...routes].sort((a, b) => (b.priority || 0) - (a.priority || 0))

  for (const route of sortedRoutes) {
    if (route.method !== method) continue

    const match = matchPath(route.path, path)
    if (match) {
      return {
        handler: route.handler,
        params: match,
        middleware: route.middleware || [],
        cache: route.cache,
        priority: route.priority || 0
      }
    }
  }

  return null
}

export const matchPath = (routePath: string, requestPath: string): Record<string, string> | null => {
  const routeSegments = routePath.split('/').filter(Boolean)
  const requestSegments = requestPath.split('/').filter(Boolean)

  if (routeSegments.length !== requestSegments.length) {
    return null
  }

  const params: Record<string, string> = {}

  for (let i = 0; i < routeSegments.length; i++) {
    const routeSegment = routeSegments[i]
    const requestSegment = requestSegments[i]

    if (routeSegment.startsWith(':')) {
      const paramName = routeSegment.slice(1)
      params[paramName] = decodeURIComponent(requestSegment)
    } else if (routeSegment === '*') {
      params['*'] = requestSegment
    } else if (routeSegment !== requestSegment) {
      return null
    }
  }

  return params
}

export const calculateRoutePriority = (path: string): number => {
  let priority = 100

  const segments = path.split('/').filter(Boolean)
  for (const segment of segments) {
    if (segment.startsWith(':')) {
      priority -= 10
    } else if (segment === '*') {
      priority -= 20
    } else {
      priority += 5
    }
  }

  priority += segments.length * 2
  return priority
}

// Pure functions for middleware composition
export const composeMiddleware = (
  middleware: MiddlewareChain
): MiddlewareFunction => {
  return async (req: Request, res: Response, final: () => Promise<void>) => {
    let index = 0

    const dispatch = async (i: number): Promise<void> => {
      if (i <= index) {
        throw new Error('next() called multiple times')
      }

      index = i

      if (i >= middleware.length) {
        return final()
      }

      const fn = middleware[i]
      return fn(req, res, () => dispatch(i + 1))
    }

    return dispatch(0)
  }
}

export const applyMiddleware = async (
  req: Request,
  res: Response,
  middleware: MiddlewareChain,
  handler: RouteHandler
): Promise<any> => {
  const composed = composeMiddleware(middleware)

  return composed(req, res, async () => {
    return handler(req, res)
  })
}

// Pure functions for error handling
export const createError = (
  code: string,
  message: string,
  statusCode: number = 500,
  details?: any
) => ({
  code,
  message,
  statusCode,
  details,
  timestamp: new Date().toISOString()
})

export const isError = (value: any): value is Error => {
  return value instanceof Error
}

export const isHttpError = (error: any): boolean => {
  return error && typeof error.statusCode === 'number'
}

// Pure functions for validation
export const validateRequest = (req: Request): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!req.method) {
    errors.push('Method is required')
  }

  if (!req.url) {
    errors.push('URL is required')
  }

  if (!req.headers) {
    errors.push('Headers are required')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

export const validateResponse = (res: Response): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (typeof res.status !== 'number' || res.status < 100 || res.status > 599) {
    errors.push('Status must be a valid HTTP status code')
  }

  if (!res.headers || typeof res.headers !== 'object') {
    errors.push('Headers must be an object')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// Pure functions for caching
export const createCacheKey = (
  method: string,
  path: string,
  query?: Record<string, string>,
  vary?: string[]
): string => {
  const base = `${method}:${path}`

  if (!query || Object.keys(query).length === 0) {
    return base
  }

  const queryString = new URLSearchParams(query).toString()
  return `${base}?${queryString}`
}

export const isExpired = (expires: number): boolean => Date.now() > expires

// Pure functions for rate limiting
export const createRateLimitKey = (
  identifier: string,
  windowMs: number
): string => {
  const windowStart = Math.floor(Date.now() / windowMs) * windowMs
  return `rate-limit:${identifier}:${windowStart}`
}

export const isRateLimited = (
  currentCount: number,
  maxRequests: number
): boolean => {
  return currentCount >= maxRequests
}

// Pure functions for security
export const sanitizeInput = (input: any): any => {
  if (typeof input === 'string') {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeInput)
  }

  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value)
    }
    return sanitized
  }

  return input
}

export const detectThreats = (input: string): { sqlInjection: boolean; xss: boolean } => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(--|\*\/|\/\*|;|'|\"|`)/,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(\b(OR|AND)\s+['"].*['"]\s*=\s*['"].*['"])/i
  ]

  const xssPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>|<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>|<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>|<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi

  return {
    sqlInjection: sqlPatterns.some(pattern => pattern.test(input)),
    xss: xssPattern.test(input)
  }
}

// Pure functions for logging
export const createLogEntry = (
  level: string,
  message: string,
  metadata?: Record<string, any>
) => ({
  timestamp: new Date().toISOString(),
  level,
  message,
  metadata: metadata || {}
})

export const shouldLog = (currentLevel: string, targetLevel: string): boolean => {
  const levels = ['debug', 'info', 'warn', 'error', 'fatal']
  const currentIndex = levels.indexOf(currentLevel)
  const targetIndex = levels.indexOf(targetLevel)

  return targetIndex >= currentIndex
}

// Pure functions for metrics
export const calculateMetrics = (
  requests: { duration: number; status: number }[],
  timeWindow: number
) => {
  const totalRequests = requests.length
  const successfulRequests = requests.filter(r => r.status < 400).length
  const errorRequests = requests.filter(r => r.status >= 400).length

  const averageResponseTime = totalRequests > 0
    ? requests.reduce((sum, r) => sum + r.duration, 0) / totalRequests
    : 0

  const requestsPerSecond = totalRequests / (timeWindow / 1000)
  const errorRate = totalRequests > 0 ? (errorRequests / totalRequests) * 100 : 0

  return {
    totalRequests,
    successfulRequests,
    errorRequests,
    averageResponseTime,
    requestsPerSecond,
    errorRate
  }
}
