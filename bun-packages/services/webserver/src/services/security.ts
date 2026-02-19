/**
 * Security service - Functional approach
 */

import { createHash, randomBytes, timingSafeEqual } from 'crypto'
import type { 
  Request, 
  Response, 
  MiddlewareFunction,
  SecurityConfig,
  AuthenticationConfig,
  AuthorizationConfig,
  JwtOptions,
  BasicOptions,
  OAuthOptions,
  SessionOptions,
  RbacConfig,
  AclConfig,
  AclRule
} from '../types'

// Security state
type SecurityState = {
  config: Required<SecurityConfig>
}

// Configuration merger
const mergeConfig = (config: SecurityConfig): Required<SecurityConfig> => ({
  helmet: config.helmet ?? true,
  csrf: config.csrf ?? false,
  xss: config.xss ?? true,
  sqlInjection: config.sqlInjection ?? true,
  authentication: config.authentication,
  authorization: config.authorization
})

// Initial state
export const createSecurityState = (config: SecurityConfig): SecurityState => ({
  config: mergeConfig(config)
})

// Pure functions for security
export const applySecurity = async (
  state: SecurityState,
  req: Request,
  res: Response
): Promise<void> => {
  // Apply security headers
  if (state.config.helmet) {
    applyHelmet(res, state.config.helmet === true ? {} : state.config.helmet)
  }

  // Apply CSRF protection
  if (state.config.csrf) {
    await applyCSRF(req, res, state.config.csrf === true ? {} : state.config.csrf)
  }

  // Apply XSS protection
  if (state.config.xss) {
    await applyXSSProtection(req, res, state.config.xss === true ? {} : state.config.xss)
  }

  // Apply SQL injection protection
  if (state.config.sqlInjection) {
    await applySQLInjectionProtection(req, res, state.config.sqlInjection === true ? {} : state.config.sqlInjection)
  }
}

const applyHelmet = (res: Response, options: any): void => {
  // Content Security Policy
  if (options.contentSecurityPolicy !== false) {
    const defaultCSP = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    res.headers['Content-Security-Policy'] = options.contentSecurityPolicy || defaultCSP
  }

  // Cross Origin Embedder Policy
  if (options.crossOriginEmbedderPolicy !== false) {
    res.headers['Cross-Origin-Embedder-Policy'] = 'require-corp'
  }

  // Cross Origin Opener Policy
  if (options.crossOriginOpenerPolicy !== false) {
    res.headers['Cross-Origin-Opener-Policy'] = 'same-origin'
  }

  // Cross Origin Resource Policy
  if (options.crossOriginResourcePolicy !== false) {
    res.headers['Cross-Origin-Resource-Policy'] = 'cross-origin'
  }

  // DNS Prefetch Control
  if (options.dnsPrefetchControl !== false) {
    res.headers['X-DNS-Prefetch-Control'] = 'off'
  }

  // Frameguard
  if (options.frameguard !== false) {
    const frameguard = typeof options.frameguard === 'boolean' ? 
      { action: 'deny' } : options.frameguard
    res.headers['X-Frame-Options'] = frameguard.action === 'deny' ? 'DENY' : 'SAMEORIGIN'
  }

  // Hide Powered By
  if (options.hidePoweredBy !== false) {
    delete res.headers['X-Powered-By']
    res.headers['X-Powered-By'] = 'WebServer'
  }

  // HSTS
  if (options.hsts !== false) {
    const hsts = typeof options.hsts === 'boolean' ? 
      { maxAge: 31536000, includeSubDomains: true, preload: true } : options.hsts
    const directives = [`max-age=${hsts.maxAge}`]
    
    if (hsts.includeSubDomains) directives.push('includeSubDomains')
    if (hsts.preload) directives.push('preload')
    
    res.headers['Strict-Transport-Security'] = directives.join('; ')
  }

  // IE No Open
  if (options.ieNoOpen !== false) {
    res.headers['X-Download-Options'] = 'noopen'
  }

  // No Sniff
  if (options.noSniff !== false) {
    res.headers['X-Content-Type-Options'] = 'nosniff'
  }

  // Origin Agent Cluster
  if (options.originAgentCluster !== false) {
    res.headers['Origin-Agent-Cluster'] = '?1'
  }

  // Permitted Cross Domain Policies
  if (options.permittedCrossDomainPolicies !== false) {
    res.headers['X-Permitted-Cross-Domain-Policies'] = 'none'
  }

  // Referrer Policy
  if (options.referrerPolicy !== false) {
    const referrerPolicy = typeof options.referrerPolicy === 'boolean' ? 
      { policy: 'no-referrer' } : options.referrerPolicy
    res.headers['Referrer-Policy'] = referrerPolicy.policy
  }

  // XSS Filter
  if (options.xssFilter !== false) {
    res.headers['X-XSS-Protection'] = '1; mode=block'
  }
}

const applyCSRF = async (req: Request, res: Response, options: any): Promise<void> => {
  const csrfOptions = options || {}
  
  // Skip CSRF for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return
  }

  const token = generateCSRFToken()
  const cookieName = csrfOptions.cookie?.key || '_csrf'
  const headerName = 'x-csrf-token'

  // Set CSRF token in cookie
  if (csrfOptions.cookie !== false) {
    const cookieOptions = [
      `Path=${csrfOptions.cookie?.path || '/'}`,
      'HttpOnly',
      csrfOptions.cookie?.secure ? 'Secure' : '',
      csrfOptions.cookie?.sameSite ? `SameSite=${csrfOptions.cookie.sameSite}` : 'SameSite=Strict'
    ].filter(Boolean).join('; ')

    res.headers['Set-Cookie'] = `${cookieName}=${token}; ${cookieOptions}`
  }

  // Validate CSRF token
  const cookieToken = getCookie(req, cookieName)
  const headerToken = req.headers[headerName]

  if (!cookieToken || !headerToken || !validateCSRFToken(cookieToken, headerToken)) {
    res.status = 403
    res.body = {
      error: {
        code: 'ERR_CSRF_TOKEN_INVALID',
        message: 'Invalid CSRF token'
      }
    }
    return
  }
}

const applyXSSProtection = async (req: Request, res: Response, options: any): Promise<void> => {
  const xssOptions = options || {}

  // Sanitize input data
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body, xssOptions)
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query, xssOptions)
  }

  // Sanitize URL parameters
  if (req.params) {
    req.params = sanitizeObject(req.params, xssOptions)
  }
}

const applySQLInjectionProtection = async (req: Request, res: Response, options: any): Promise<void> => {
  const sqlOptions = options || {}

  // Check for SQL injection patterns
  const suspiciousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(--|\*\/|\/\*|;|'|\"|`)/,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(\b(OR|AND)\s+['"].*['"]\s*=\s*['"].*['"])/i
  ]

  const checkValue = (value: string): boolean => {
    return suspiciousPatterns.some(pattern => pattern.test(value))
  }

  const checkObject = (obj: any): boolean => {
    if (typeof obj === 'string') {
      return checkValue(obj)
    } else if (Array.isArray(obj)) {
      return obj.some(item => checkObject(item))
    } else if (typeof obj === 'object' && obj !== null) {
      return Object.values(obj).some(value => checkObject(value))
    }
    return false
  }

  // Check request body
  if (req.body && checkObject(req.body)) {
    res.status = 400
    res.body = {
      error: {
        code: 'ERR_SQL_INJECTION_DETECTED',
        message: 'SQL injection pattern detected'
      }
    }
    return
  }

  // Check query parameters
  if (req.query && checkObject(req.query)) {
    res.status = 400
    res.body = {
      error: {
        code: 'ERR_SQL_INJECTION_DETECTED',
        message: 'SQL injection pattern detected'
      }
    }
    return
  }

  // Check URL parameters
  if (req.params && checkObject(req.params)) {
    res.status = 400
    res.body = {
      error: {
        code: 'ERR_SQL_INJECTION_DETECTED',
        message: 'SQL injection pattern detected'
      }
    }
    return
  }
}

// Authentication functions
export const jwt = (secret: string, options: JwtOptions = {}): MiddlewareFunction => {
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

export const basic = (users: Record<string, string>): MiddlewareFunction => {
  return async (req: Request, res: Response, next: () => Promise<void>) => {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      res.status = 401
      res.headers['WWW-Authenticate'] = 'Basic realm="Secure Area"'
      res.body = {
        error: {
          code: 'ERR_MISSING_CREDENTIALS',
          message: 'Basic authentication is required'
        }
      }
      return
    }

    try {
      const credentials = Buffer.from(authHeader.substring(6), 'base64').toString()
      const [username, password] = credentials.split(':')
      
      if (!users[username] || users[username] !== password) {
        res.status = 401
        res.body = {
          error: {
            code: 'ERR_INVALID_CREDENTIALS',
            message: 'Invalid username or password'
          }
        }
        return
      }

      req.user = {
        username,
        role: 'user'
      }

      await next()
    } catch (error) {
      res.status = 401
      res.body = {
        error: {
          code: 'ERR_INVALID_CREDENTIALS',
          message: 'Invalid credentials format'
        }
      }
    }
  }
}

export const rbac = (roles: Record<string, string[]>): MiddlewareFunction => {
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
    const userPermissions = roles[userRole] || []
    
    // Check if user has required permissions for this route
    const requiredPermissions = getRequiredPermissions(req.method, req.path)
    const hasPermission = requiredPermissions.every(perm => userPermissions.includes(perm))

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

// Helper functions
const generateCSRFToken = (): string => {
  return randomBytes(32).toString('hex')
}

const validateCSRFToken = (token1: string, token2: string): boolean => {
  return timingSafeEqual(Buffer.from(token1), Buffer.from(token2))
}

const getCookie = (req: Request, name: string): string | undefined => {
  const cookies = req.headers.cookie || ''
  const cookiePairs = cookies.split(';')
  
  for (const pair of cookiePairs) {
    const [key, value] = pair.trim().split('=')
    if (key === name) {
      return value
    }
  }
  
  return undefined
}

const sanitizeObject = (obj: any, options: any): any => {
  let sanitized = obj
  
  // Remove potentially dangerous HTML tags
  if (options.strip !== false) {
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
  }

  // Escape HTML entities
  if (options.escape !== false) {
    if (typeof sanitized === 'string') {
      sanitized = sanitized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
    }
  }

  // Check against whitelist
  if (options.whitelist && Array.isArray(options.whitelist)) {
    const whitelist = new Set(options.whitelist)
    if (typeof sanitized === 'string') {
      const words = sanitized.split(/\s+/)
      const filteredWords = words.filter(word => whitelist.has(word))
      sanitized = filteredWords.join(' ')
    }
  }

  return sanitized
}

const getRequiredPermissions = (method: string, path: string): string[] => {
  // Simple permission mapping - in real implementation this would be more sophisticated
  const permissions: Record<string, string[]> = {
    'GET': ['read'],
    'POST': ['create'],
    'PUT': ['update'],
    'PATCH': ['update'],
    'DELETE': ['delete']
  }

  return permissions[method] || []
}

// Security factory
export const createSecurity = (config: SecurityConfig): SecurityState => createSecurityState(config)

// Utility functions
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
