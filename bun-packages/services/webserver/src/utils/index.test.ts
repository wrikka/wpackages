/**
 * Tests for utility functions
 */

import { describe, it, expect } from 'bun:test'
import {
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
} from './index'

describe('Utility Functions', () => {
  describe('createRequestId', () => {
    it('should create a unique request ID', () => {
      const id1 = createRequestId()
      const id2 = createRequestId()

      expect(id1).toBeTypeOf('string')
      expect(id2).toBeTypeOf('string')
      expect(id1).not.toBe(id2)
      expect(id1.length).toBeGreaterThan(0)
    })
  })

  describe('parseUrl', () => {
    it('should parse a valid URL', () => {
      const parsed = parseUrl('http://localhost:3000/api/users?id=123')

      expect(parsed.protocol).toBe('http:')
      expect(parsed.hostname).toBe('localhost:3000')
      expect(parsed.pathname).toBe('/api/users')
      expect(parsed.searchParams.get('id')).toBe('123')
    })
  })

  describe('getClientIp', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const headers = { 'x-forwarded-for': '192.168.1.1, 10.0.0.1' }
      const ip = getClientIp(headers)

      expect(ip).toBe('192.168.1.1')
    })

    it('should extract IP from x-real-ip header', () => {
      const headers = { 'x-real-ip': '192.168.1.2' }
      const ip = getClientIp(headers)

      expect(ip).toBe('192.168.1.2')
    })

    it('should return undefined for missing IP headers', () => {
      const headers = {}
      const ip = getClientIp(headers)

      expect(ip).toBeUndefined()
    })
  })

  describe('getUserAgent', () => {
    it('should extract user agent from header', () => {
      const headers = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      const userAgent = getUserAgent(headers)

      expect(userAgent).toBe('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')
    })

    it('should return undefined for missing user agent', () => {
      const headers = {}
      const userAgent = getUserAgent(headers)

      expect(userAgent).toBeUndefined()
    })
  })

  describe('Validation functions', () => {
    it('should validate email addresses', () => {
      expect(isEmail('test@example.com')).toBe(true)
      expect(isEmail('invalid-email')).toBe(false)
      expect(isEmail('')).toBe(false)
    })

    it('should validate URLs', () => {
      expect(isUrl('http://example.com')).toBe(true)
      expect(isUrl('https://example.com/path')).toBe(true)
      expect(isUrl('invalid-url')).toBe(false)
      expect(isUrl('')).toBe(false)
    })

    it('should validate UUIDs', () => {
      expect(isUuid('123e4567-e89b-12d3-a456-426614174000')).toBe(true)
      expect(isUuid('invalid-uuid')).toBe(false)
      expect(isUuid('')).toBe(false)
    })

    it('should validate slugs', () => {
      expect(isSlug('valid-slug')).toBe(true)
      expect(isSlug('valid_slug')).toBe(true)
      expect(isSlug('ValidSlug123')).toBe(true)
      expect(isSlug('invalid slug!')).toBe(false)
      expect(isSlug('')).toBe(false)
    })
  })

  describe('Password functions', () => {
    it('should hash and compare passwords', async () => {
      const password = 'test-password'
      const hashed = await hashPassword(password)

      expect(hashed).not.toBe(password)
      expect(hashed.length).toBeGreaterThan(0)

      const isValid = await comparePassword(password, hashed)
      expect(isValid).toBe(true)

      const isInvalid = await comparePassword('wrong-password', hashed)
      expect(isInvalid).toBe(false)
    })
  })

  describe('generateApiKey', () => {
    it('should generate an API key', () => {
      const apiKey = generateApiKey()

      expect(apiKey).toBeTypeOf('string')
      expect(apiKey.length).toBeGreaterThan(20)
    })
  })

  describe('sanitizeString', () => {
    it('should sanitize HTML characters', () => {
      const input = '<script>alert("xss")</script>'
      const sanitized = sanitizeString(input)

      expect(sanitized).not.toContain('<script>')
      expect(sanitized).not.toContain('</script>')
      expect(sanitized).toContain('&lt;script&gt;')
    })
  })

  describe('Security detection', () => {
    it('should detect SQL injection attempts', () => {
      expect(detectSqlInjection("'; DROP TABLE users; --")).toBe(true)
      expect(detectSqlInjection("SELECT * FROM users WHERE id = 1")).toBe(true)
      expect(detectSqlInjection("normal text")).toBe(false)
    })

    it('should detect XSS attempts', () => {
      expect(detectXss('<script>alert("xss")</script>')).toBe(true)
      expect(detectXss('<iframe src="malicious.com"></iframe>')).toBe(true)
      expect(detectXss('normal text')).toBe(false)
    })
  })

  describe('createTimer', () => {
    it('should create a timer', () => {
      const timer = createTimer()
      expect(timer.start).toBeTypeOf('number')
      expect(timer.end).toBeUndefined()
      expect(timer.duration).toBeUndefined()

      timer.stop()
      expect(timer.end).toBeTypeOf('number')
      expect(timer.duration).toBeTypeOf('number')
      expect(timer.duration).toBeGreaterThanOrEqual(0)
    })
  })

  describe('debounce', () => {
    it('should debounce function calls', async () => {
      let count = 0
      const increment = () => count++
      const debouncedIncrement = debounce(increment, 50)

      debouncedIncrement()
      debouncedIncrement()
      debouncedIncrement()

      expect(count).toBe(0)

      await new Promise(resolve => setTimeout(resolve, 60))
      expect(count).toBe(1)
    })
  })

  describe('throttle', () => {
    it('should throttle function calls', async () => {
      let count = 0
      const increment = () => count++
      const throttledIncrement = throttle(increment, 50)

      throttledIncrement()
      throttledIncrement()
      throttledIncrement()

      expect(count).toBe(1)

      await new Promise(resolve => setTimeout(resolve, 60))
      throttledIncrement()
      expect(count).toBe(2)
    })
  })

  describe('Response creators', () => {
    it('should create success response', () => {
      const response = createSuccessResponse({ data: 'test' })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        success: true,
        data: { data: 'test' }
      })
    })

    it('should create error response', () => {
      const response = createErrorResponse('Test error', 400)

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        success: false,
        error: 'Test error'
      })
    })
  })
})
