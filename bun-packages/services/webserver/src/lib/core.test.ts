/**
 * Tests for core library functions
 */

import { describe, it, expect } from 'bun:test'
import { 
  createRequest, 
  createResponse, 
  createRoute, 
  matchRoute, 
  matchPath,
  calculateRoutePriority,
  createError,
  validateRequest,
  validateResponse
} from './core'

describe('Core Library', () => {
  describe('createRequest', () => {
    it('should create a request object', () => {
      const request = createRequest(
        'req-1',
        'GET',
        'http://localhost:3000/api/users',
        { 'content-type': 'application/json' },
        { name: 'John' },
        { id: '123' }
      )

      expect(request.id).toBe('req-1')
      expect(request.method).toBe('GET')
      expect(request.url).toBe('http://localhost:3000/api/users')
      expect(request.path).toBe('/api/users')
      expect(request.protocol).toBe('http:')
      expect(request.hostname).toBe('localhost:3000')
      expect(request.headers).toEqual({ 'content-type': 'application/json' })
      expect(request.body).toEqual({ name: 'John' })
      expect(request.query).toEqual({ id: '123' })
      expect(request.params).toEqual({ id: '123' })
      expect(request.startTime).toBeTypeOf('number')
    })
  })

  describe('createResponse', () => {
    it('should create a response object', () => {
      const response = createResponse(200, { 'x-custom': 'value' }, { data: 'test' })

      expect(response.status).toBe(200)
      expect(response.headers).toEqual({
        'content-type': 'application/json',
        'x-custom': 'value'
      })
      expect(response.body).toEqual({ data: 'test' })
      expect(response.sent).toBe(false)
      expect(response.startTime).toBeTypeOf('number')
    })

    it('should use default values', () => {
      const response = createResponse()

      expect(response.status).toBe(200)
      expect(response.headers).toEqual({
        'content-type': 'application/json'
      })
      expect(response.body).toBeUndefined()
      expect(response.sent).toBe(false)
    })
  })

  describe('createRoute', () => {
    it('should create a route object', () => {
      const handler = async () => ({ message: 'Hello' })
      const middleware = []
      const route = createRoute('GET', '/test', handler, middleware, 10)

      expect(route.method).toBe('GET')
      expect(route.path).toBe('/test')
      expect(route.handler).toBe(handler)
      expect(route.middleware).toBe(middleware)
      expect(route.priority).toBe(10)
    })
  })

  describe('matchPath', () => {
    it('should match static paths', () => {
      const params = matchPath('/users', '/users')
      expect(params).toEqual({})
    })

    it('should match dynamic paths', () => {
      const params = matchPath('/users/:id', '/users/123')
      expect(params).toEqual({ id: '123' })
    })

    it('should decode URL parameters', () => {
      const params = matchPath('/search/:query', '/search/hello%20world')
      expect(params).toEqual({ query: 'hello world' })
    })

    it('should handle wildcard routes', () => {
      const params = matchPath('/files/*', '/files/document.pdf')
      expect(params).toEqual({ '*': 'document.pdf' })
    })

    it('should return null for non-matching paths', () => {
      const params = matchPath('/users', '/posts')
      expect(params).toBeNull()
    })

    it('should return null for different segment counts', () => {
      const params = matchPath('/users/:id', '/users/123/profile')
      expect(params).toBeNull()
    })
  })

  describe('calculateRoutePriority', () => {
    it('should prioritize static routes over dynamic', () => {
      const staticPriority = calculateRoutePriority('/users')
      const dynamicPriority = calculateRoutePriority('/users/:id')

      expect(staticPriority).toBeGreaterThan(dynamicPriority)
    })

    it('should prioritize based on path length', () => {
      const shortPriority = calculateRoutePriority('/api')
      const longPriority = calculateRoutePriority('/api/v1/users')

      expect(longPriority).toBeGreaterThan(shortPriority)
    })
  })

  describe('createError', () => {
    it('should create an error object', () => {
      const error = createError('TEST_ERROR', 'Test message', 400, { field: 'email' })

      expect(error.code).toBe('TEST_ERROR')
      expect(error.message).toBe('Test message')
      expect(error.statusCode).toBe(400)
      expect(error.details).toEqual({ field: 'email' })
      expect(error.timestamp).toBeTypeOf('string')
    })
  })

  describe('validateRequest', () => {
    it('should validate a valid request', () => {
      const request = createRequest('req-1', 'GET', 'http://localhost:3000', {})
      const result = validateRequest(request)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect invalid request', () => {
      const request = { method: '', url: '', headers: {} } as any
      const result = validateRequest(request)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Method is required')
      expect(result.errors).toContain('URL is required')
    })
  })

  describe('validateResponse', () => {
    it('should validate a valid response', () => {
      const response = createResponse(200, {}, {})
      const result = validateResponse(response)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect invalid response', () => {
      const response = { status: 999, headers: 'invalid' } as any
      const result = validateResponse(response)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Status must be a valid HTTP status code')
      expect(result.errors).toContain('Headers must be an object')
    })
  })
})
