/**
 * Middleware service - Functional approach
 */

import { createHash, randomBytes, timingSafeEqual } from 'crypto'
import type { 
  Request, 
  Response, 
  MiddlewareFunction,
  CorsOptions,
  RateLimitConfig,
  SecurityConfig
} from '../types'

// Rate limiting state
type RateLimitState = {
  requests: Map<string, { count: number; resetTime: number }>
}

// Middleware functions
export const cors = (options: CorsOptions = {}): MiddlewareFunction => {
  const defaultOptions: Required<CorsOptions> = {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: [],
    credentials: false,
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204
  }

  const corsOptions = { ...defaultOptions, ...options }

  return async (req: Request, res: Response, next: () => Promise<void>) => {
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.headers['Access-Control-Allow-Origin'] = getOriginValue(corsOptions.origin, req.headers.origin)
      res.headers['Access-Control-Allow-Methods'] = corsOptions.methods.join(', ')
      res.headers['Access-Control-Allow-Headers'] = corsOptions.allowedHeaders.join(', ')
      res.headers['Access-Control-Max-Age'] = corsOptions.maxAge.toString()
      
      if (corsOptions.exposedHeaders.length > 0) {
        res.headers['Access-Control-Expose-Headers'] = corsOptions.exposedHeaders.join(', ')
      }
      
      if (corsOptions.credentials) {
        res.headers['Access-Control-Allow-Credentials'] = 'true'
      }
      
      res.status = corsOptions.optionsSuccessStatus
      return
    }

    // Add CORS headers to actual requests
    res.headers['Access-Control-Allow-Origin'] = getOriginValue(corsOptions.origin, req.headers.origin)
    
    if (corsOptions.credentials) {
      res.headers['Access-Control-Allow-Credentials'] = 'true'
    }
    
    if (corsOptions.exposedHeaders.length > 0) {
      res.headers['Access-Control-Expose-Headers'] = corsOptions.exposedHeaders.join(', ')
    }

    await next()
  }
}

export const rateLimit = (config: RateLimitConfig): MiddlewareFunction => {
  const requests = new Map<string, { count: number; resetTime: number }>()
  
  return async (req: Request, res: Response, next: () => Promise<void>) => {
    const key = config.keyGenerator ? config.keyGenerator(req) : getClientId(req)
    const now = Date.now()
    
    // Clean up expired entries
    for (const [k, v] of requests.entries()) {
      if (now > v.resetTime) {
        requests.delete(k)
      }
    }
    
    // Check current request count
    let requestData = requests.get(key)
    if (!requestData) {
      requestData = { count: 0, resetTime: now + config.windowMs }
      requests.set(key, requestData)
    }

    requestData.count++

    // Set rate limit headers
    res.headers['X-RateLimit-Limit'] = config.max.toString()
    res.headers['X-RateLimit-Remaining'] = Math.max(0, config.max - requestData.count).toString()
    res.headers['X-RateLimit-Reset'] = new Date(requestData.resetTime).toISOString()
    
    // Check if limit exceeded
    if (requestData.count > config.max) {
      res.status = 429
      res.body = {
        error: {
          code: 'ERR_RATE_LIMIT_EXCEEDED',
          message: config.message || 'Too many requests',
          retryAfter: Math.ceil((requestData.resetTime - now) / 1000)
        }
      }
      return
    }

    await next()
  }
}

export const compression = (): MiddlewareFunction => {
  return async (req: Request, res: Response, next: () => Promise<void>) => {
    const acceptEncoding = req.headers['accept-encoding'] || ''
    
    if (acceptEncoding.includes('gzip')) {
      res.headers['Content-Encoding'] = 'gzip'
    } else if (acceptEncoding.includes('deflate')) {
      res.headers['Content-Encoding'] = 'deflate'
    } else if (acceptEncoding.includes('br')) {
      res.headers['Content-Encoding'] = 'br'
    }
    
    await next()
  }
}

export const security = (options: SecurityConfig = {}): MiddlewareFunction => {
  return async (req: Request, res: Response, next: () => Promise<void>) => {
    // Security headers
    res.headers['X-Content-Type-Options'] = 'nosniff'
    res.headers['X-Frame-Options'] = 'DENY'
    res.headers['X-XSS-Protection'] = '1; mode=block'
    res.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    
    if (options.helmet !== false) {
      res.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
      res.headers['Content-Security-Policy'] = "default-src 'self'"
    }
    
    await next()
  }
}

export const logger = (): MiddlewareFunction => {
  return async (req: Request, res: Response, next: () => Promise<void>) => {
    const startTime = Date.now()
    
    await next()
    
    const duration = Date.now() - startTime
    console.log(`${req.method} ${req.path} - ${res.status} - ${duration}ms`)
  }
}

export const requestId = (): MiddlewareFunction => {
  return async (req: Request, res: Response, next: () => Promise<void>) => {
    res.headers['X-Request-ID'] = req.id
    await next()
  }
}

export const trustProxy = (trustProxy: boolean | string[] = true): MiddlewareFunction => {
  return async (req: Request, res: Response, next: () => Promise<void>) => {
    if (trustProxy) {
      const xForwardedFor = req.headers['x-forwarded-for']
      if (xForwardedFor) {
        req.ip = xForwardedFor.split(',')[0].trim()
      }
      
      const xForwardedProto = req.headers['x-forwarded-proto']
      if (xForwardedProto) {
        req.protocol = xForwardedProto
      }
      
      const xForwardedHost = req.headers['x-forwarded-host']
      if (xForwardedHost) {
        req.hostname = xForwardedHost
      }
    }
    
    await next()
  }
}

export const bodyParser = (options: { limit?: string; type?: string } = {}): MiddlewareFunction => {
  const { limit = '10mb', type = 'application/json' } = options
  
  return async (req: Request, res: Response, next: () => Promise<void>) => {
    if (req.method === 'GET' || req.method === 'HEAD') {
      await next()
      return
    }
    
    const contentType = req.headers['content-type'] || ''
    
    if (!contentType.includes(type)) {
      await next()
      return
    }
    
    try {
      // Body parsing would be handled by server implementation
      // This middleware can add validation and size limits
      const contentLength = parseInt(req.headers['content-length'] || '0')
      const maxSize = parseSize(limit)
      
      if (contentLength > maxSize) {
        res.status = 413
        res.body = {
          error: {
            code: 'ERR_PAYLOAD_TOO_LARGE',
            message: `Request entity too large. Maximum size is ${limit}`
          }
        }
        return
      }
      
      await next()
    } catch (error) {
      res.status = 400
      res.body = {
        error: {
          code: 'ERR_INVALID_BODY',
          message: 'Invalid request body'
        }
      }
    }
  }
}

export const validation = (schema: any): MiddlewareFunction => {
  return async (req: Request, res: Response, next: () => Promise<void>) => {
    try {
      // Validation implementation would go here
      await next()
    } catch (error) {
      res.status = 400
      res.body = {
        error: {
          code: 'ERR_VALIDATION_FAILED',
          message: error.message
        }
      }
    }
  }
}

export const authentication = (options: { type: 'jwt' | 'basic' | 'bearer' | 'oauth' } = { type: 'jwt' }): MiddlewareFunction => {
  return async (req: Request, res: Response, next: () => Promise<void>) => {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status = 401
      res.body = {
        error: {
          code: 'ERR_MISSING_TOKEN',
          message: 'JWT token is required'
        }
      }
      return
    }

    const token = authHeader.substring(7)
    
    try {
      // JWT validation would go here
      console.log('Validating JWT token:', token)
      
      // Mock user data for now
      req.user = {
        id: '1',
        email: 'user@example.com',
        role: 'user'
      }
      
      await next()
    } catch (error) {
      res.status = 401
      res.body = {
        error: {
          code: 'ERR_INVALID_TOKEN',
          message: 'Invalid JWT token'
        }
      }
    }
  }
}

export const authorization = (permissions: string[]): MiddlewareFunction => {
  return async (req: Request, res: Response, next: () => Promise<void>) => {
    if (!req.user) {
      res.status = 401
      res.body = {
        error: {
          code: 'ERR_UNAUTHORIZED',
          message: 'Authentication required'
        }
      }
      return
    }

    const userRole = req.user.role || 'user'
    const userPermissions = ['read', 'write'] // Mock permissions
    
    const hasPermission = permissions.every(perm => userPermissions.includes(perm))

    if (!hasPermission) {
      res.status = 403
      res.body = {
        error: {
          code: 'ERR_FORBIDDEN',
          message: 'Insufficient permissions'
        }
      }
      return
    }

    await next()
  }
}

export const cache = (options: { ttl: number; key?: string }): MiddlewareFunction => {
  return async (req: Request, res: Response, next: () => Promise<void>) => {
    // Cache middleware implementation would go here
    await next()
  }
}

export const healthCheck = (): MiddlewareFunction => {
  return async (req: Request, res: Response, next: () => Promise<void>) => {
    if (req.path === '/health') {
      res.status = 200
      res.body = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      }
      return
    }
    
    await next()
  }
}

export const errorHandling = (): MiddlewareFunction => {
  return async (req: Request, res: Response, next: () => Promise<void>) => {
    try {
      await next()
    } catch (error) {
      console.error('Unhandled error:', error)
      res.status = 500
      res.body = {
        error: {
          code: 'ERR_INTERNAL_SERVER_ERROR',
          message: 'Internal server error',
          requestId: req.id
        }
      }
    }
  }
}

// Helper functions
const getOriginValue = (origin: string | string[] | boolean, requestOrigin?: string): string => {
  if (origin === true) {
    return requestOrigin || '*'
  }
  
  if (Array.isArray(origin)) {
    return origin.includes(requestOrigin || '') ? requestOrigin : origin[0]
  }
  
  return origin
}

const getClientId = (req: Request): string => {
  return req.ip || req.headers['x-forwarded-for'] || 'unknown'
}

const parseSize = (size: string): number => {
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

export const validateApiKey = (apiKey: string, validKeys: string[]): boolean => {
  return validKeys.includes(apiKey)
}

export const rateLimitByUser = (maxRequests: number, windowMs: number): MiddlewareFunction => {
  const userRequests = new Map<string, { count: number; resetTime: number }>()
  
  return async (req: Request, res: Response, next: () => Promise<void>) => {
    if (!req.user) {
      await next()
      return
    }

    const userId = req.user.id || req.user.username || 'anonymous'
    const now = Date.now()
    
    let requestData = userRequests.get(userId)
    if (!requestData) {
      requestData = { count: 0, resetTime: now + windowMs }
      userRequests.set(userId, requestData)
    }

    if (now > requestData.resetTime) {
      requestData.count = 0
      requestData.resetTime = now + windowMs
    }

    requestData.count++

    if (requestData.count > maxRequests) {
      res.status = 429
      res.body = {
        error: {
          code: 'ERR_USER_RATE_LIMIT_EXCEEDED',
          message: 'User rate limit exceeded',
          retryAfter: Math.ceil((requestData.resetTime - now) / 1000)
        }
      }
      return
    }

    await next()
  }
}
