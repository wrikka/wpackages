/**
 * Tests for router service
 */

import { describe, it, expect, beforeEach } from 'bun:test'
import { createRouterState, addRoute, findRoute, handleRequest, get, post } from './router'
import { createRequest, createResponse } from '../lib/core'

describe('Router Service', () => {
  let router: ReturnType<typeof createRouterState>

  beforeEach(() => {
    router = createRouterState()
  })

  describe('addRoute', () => {
    it('should add a new route', () => {
      const handler = async () => ({ message: 'Hello World' })
      const updatedRouter = addRoute(router, 'GET', '/test', handler)
      
      expect(updatedRouter.routes.get('GET')).toHaveLength(1)
      expect(updatedRouter.routes.get('GET')![0].path).toBe('/test')
      expect(updatedRouter.routes.get('GET')![0].handler).toBe(handler)
    })

    it('should add multiple routes to the same method', () => {
      const handler1 = async () => ({ message: 'Route 1' })
      const handler2 = async () => ({ message: 'Route 2' })
      
      let updatedRouter = addRoute(router, 'GET', '/route1', handler1)
      updatedRouter = addRoute(updatedRouter, 'GET', '/route2', handler2)
      
      expect(updatedRouter.routes.get('GET')).toHaveLength(2)
    })
  })

  describe('findRoute', () => {
    it('should find a matching route', () => {
      const handler = async () => ({ message: 'Found' })
      const updatedRouter = addRoute(router, 'GET', '/users/:id', handler)
      
      const match = findRoute(updatedRouter, 'GET', '/users/123')
      expect(match).toBeTruthy()
      expect(match!.params).toEqual({ id: '123' })
    })

    it('should return null for non-matching route', () => {
      const handler = async () => ({ message: 'Found' })
      const updatedRouter = addRoute(router, 'GET', '/users', handler)
      
      const match = findRoute(updatedRouter, 'GET', '/posts')
      expect(match).toBeNull()
    })
  })

  describe('HTTP method helpers', () => {
    it('should add GET route', () => {
      const handler = async () => ({ message: 'GET' })
      const updatedRouter = get(router, '/test', handler)
      
      expect(updatedRouter.routes.get('GET')).toHaveLength(1)
    })

    it('should add POST route', () => {
      const handler = async () => ({ message: 'POST' })
      const updatedRouter = post(router, '/test', handler)
      
      expect(updatedRouter.routes.get('POST')).toHaveLength(1)
    })
  })

  describe('handleRequest', () => {
    it('should handle successful request', async () => {
      const handler = async () => ({ message: 'Success' })
      const updatedRouter = addRoute(router, 'GET', '/test', handler)
      
      const req = createRequest('req-1', 'GET', 'http://localhost:3000/test', {})
      const res = createResponse()
      
      await handleRequest(updatedRouter, req, res)
      
      expect(res.status).toBe(200)
      expect(res.body).toEqual({ message: 'Success' })
      expect(res.sent).toBe(true)
    })

    it('should handle 404 for missing route', async () => {
      const req = createRequest('req-1', 'GET', 'http://localhost:3000/notfound', {})
      const res = createResponse()
      
      await handleRequest(router, req, res)
      
      expect(res.status).toBe(404)
      expect(res.body).toEqual({
        error: {
          code: 'ERR_NOT_FOUND',
          message: 'Route not found',
          requestId: 'req-1'
        }
      })
    })

    it('should handle errors in route handler', async () => {
      const handler = async () => {
        throw new Error('Handler error')
      }
      const updatedRouter = addRoute(router, 'GET', '/error', handler)
      
      const req = createRequest('req-1', 'GET', 'http://localhost:3000/error', {})
      const res = createResponse()
      
      await handleRequest(updatedRouter, req, res)
      
      expect(res.status).toBe(500)
      expect(res.body).toEqual({
        error: {
          code: 'ERR_INTERNAL_SERVER_ERROR',
          message: 'Internal server error',
          requestId: 'req-1'
        }
      })
    })
  })
})
