/**
 * Error handling module for WebServer framework
 */

export interface WebServerError extends Error {
  code: string
  statusCode: number
  details?: any
  timestamp: string
}

export interface ValidationError extends Error {
  field: string
  value: any
  constraint: string
}

export interface RateLimitError extends Error {
  limit: number
  current: number
  resetTime: Date
}

export interface CacheError extends Error {
  key: string
  operation: 'get' | 'set' | 'delete' | 'clear'
}

export const createError = (
  code: string,
  message: string,
  statusCode: number = 500,
  details?: any
): WebServerError => {
  const error = new Error(message) as WebServerError
  error.code = code
  error.statusCode = statusCode
  error.details = details
  error.timestamp = new Date().toISOString()
  return error
}

export const createValidationError = (
  field: string,
  value: any,
  constraint: string,
  message?: string
): ValidationError => {
  const error = new Error(message || `Validation failed for field ${field}`) as ValidationError
  error.field = field
  error.value = value
  error.constraint = constraint
  return error
}

export const createRateLimitError = (
  limit: number,
  current: number,
  resetTime: Date,
  message?: string
): RateLimitError => {
  const error = new Error(message || 'Rate limit exceeded') as RateLimitError
  error.limit = limit
  error.current = current
  error.resetTime = resetTime
  return error
}

export const createCacheError = (
  key: string,
  operation: 'get' | 'set' | 'delete' | 'clear',
  originalError: Error
): CacheError => {
  const error = new Error(`Cache ${operation} failed for key ${key}: ${originalError.message}`) as CacheError
  error.key = key
  error.operation = operation
  return error
}

// Predefined error types
export const errors = {
  // HTTP Errors
  badRequest: (message?: string, details?: any) => 
    createError('BAD_REQUEST', message || 'Bad Request', 400, details),
  
  unauthorized: (message?: string, details?: any) => 
    createError('UNAUTHORIZED', message || 'Unauthorized', 401, details),
  
  forbidden: (message?: string, details?: any) => 
    createError('FORBIDDEN', message || 'Forbidden', 403, details),
  
  notFound: (message?: string, details?: any) => 
    createError('NOT_FOUND', message || 'Not Found', 404, details),
  
  methodNotAllowed: (message?: string, details?: any) => 
    createError('METHOD_NOT_ALLOWED', message || 'Method Not Allowed', 405, details),
  
  conflict: (message?: string, details?: any) => 
    createError('CONFLICT', message || 'Conflict', 409, details),
  
  unprocessableEntity: (message?: string, details?: any) => 
    createError('UNPROCESSABLE_ENTITY', message || 'Unprocessable Entity', 422, details),
  
  tooManyRequests: (message?: string, details?: any) => 
    createError('TOO_MANY_REQUESTS', message || 'Too Many Requests', 429, details),
  
  // Server Errors
  internalServerError: (message?: string, details?: any) => 
    createError('INTERNAL_SERVER_ERROR', message || 'Internal Server Error', 500, details),
  
  notImplemented: (message?: string, details?: any) => 
    createError('NOT_IMPLEMENTED', message || 'Not Implemented', 501, details),
  
  badGateway: (message?: string, details?: any) => 
    createError('BAD_GATEWAY', message || 'Bad Gateway', 502, details),
  
  serviceUnavailable: (message?: string, details?: any) => 
    createError('SERVICE_UNAVAILABLE', message || 'Service Unavailable', 503, details),
  
  // Business Logic Errors
  validationFailed: (field: string, value: any, constraint: string, message?: string) => 
    createValidationError(field, value, constraint, message),
  
  rateLimitExceeded: (limit: number, current: number, resetTime: Date, message?: string) => 
    createRateLimitError(limit, current, resetTime, message),
  
  cacheOperationFailed: (key: string, operation: 'get' | 'set' | 'delete' | 'clear', originalError: Error) => 
    createCacheError(key, operation, originalError)
}

// Error utilities
export const isWebServerError = (error: any): error is WebServerError => {
  return error && typeof error === 'object' && 'code' in error && 'statusCode' in error
}

export const isValidationError = (error: any): error is ValidationError => {
  return error && typeof error === 'object' && 'field' in error && 'constraint' in error
}

export const isRateLimitError = (error: any): error is RateLimitError => {
  return error && typeof error === 'object' && 'limit' in error && 'current' in error
}

export const isCacheError = (error: any): error is CacheError => {
  return error && typeof error === 'object' && 'key' in error && 'operation' in error
}

export const getErrorResponse = (error: any): { status: number; body: any } => {
  if (isWebServerError(error)) {
    return {
      status: error.statusCode,
      body: {
        error: {
          code: error.code,
          message: error.message,
          ...(error.details && { details: error.details }),
          timestamp: error.timestamp
        }
      }
    }
  }

  if (isValidationError(error)) {
    return {
      status: 400,
      body: {
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
          field: error.field,
          constraint: error.constraint,
          value: error.value
        }
      }
    }
  }

  if (isRateLimitError(error)) {
    return {
      status: 429,
      body: {
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: error.message,
          limit: error.limit,
          current: error.current,
          resetTime: error.resetTime.toISOString()
        }
      }
    }
  }

  // Fallback for unknown errors
  return {
    status: 500,
    body: {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        ...(process.env.NODE_ENV === 'development' && { 
          originalError: error?.message || String(error) 
        })
      }
    }
  }
}
