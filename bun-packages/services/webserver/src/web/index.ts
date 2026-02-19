/**
 * Web application entry point - Functional approach
 */

import type { ServerConfig } from '../types'
import { createServer, startServer, stopServer } from '../app/server'
import { get, post, put, del, addGlobalMiddleware } from '../services/router'

// Web application factory
export const createWebApp = (config: ServerConfig = {}) => {
  let serverState = createServer(config)
  
  // Add global middleware
  serverState = addGlobalMiddleware(serverState, [
    // Request ID middleware
    async (req, res, next) => {
      res.headers['x-request-id'] = req.id
      await next()
    },
    
    // CORS middleware
    async (req, res, next) => {
      const corsConfig = serverState.config.cors
      
      if (req.method === 'OPTIONS') {
        res.headers['Access-Control-Allow-Origin'] = typeof corsConfig.origin === 'string' ? corsConfig.origin : '*'
        res.headers['Access-Control-Allow-Methods'] = (corsConfig.methods || ['GET', 'POST', 'PUT', 'DELETE']).join(', ')
        res.headers['Access-Control-Allow-Headers'] = (corsConfig.allowedHeaders || ['Content-Type', 'Authorization']).join(', ')
        res.headers['Access-Control-Max-Age'] = (corsConfig.maxAge || 86400).toString()
        
        if (corsConfig.credentials) {
          res.headers['Access-Control-Allow-Credentials'] = 'true'
        }
        
        res.status = 204
        return
      }
      
      res.headers['Access-Control-Allow-Origin'] = typeof corsConfig.origin === 'string' ? corsConfig.origin : '*'
      
      if (corsConfig.credentials) {
        res.headers['Access-Control-Allow-Credentials'] = 'true'
      }
      
      await next()
    },
    
    // Security headers middleware
    async (req, res, next) => {
      res.headers['X-Content-Type-Options'] = 'nosniff'
      res.headers['X-Frame-Options'] = 'DENY'
      res.headers['X-XSS-Protection'] = '1; mode=block'
      res.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
      
      await next()
    },
    
    // Logger middleware
    async (req, res, next) => {
      const startTime = Date.now()
      
      await next()
      
      const duration = Date.now() - startTime
      console.log(`${req.method} ${req.path} - ${res.status} - ${duration}ms`)
    }
  ])
  
  return {
    // HTTP methods
    get: (path: string, handler: any, middleware?: any[]) => {
      serverState = get(serverState, path, handler, middleware)
      return { get: arguments.callee }
    },
    
    post: (path: string, handler: any, middleware?: any[]) => {
      serverState = post(serverState, path, handler, middleware)
      return { post: arguments.callee }
    },
    
    put: (path: string, handler: any, middleware?: any[]) => {
      serverState = put(serverState, path, handler, middleware)
      return { put: arguments.callee }
    },
    
    delete: (path: string, handler: any, middleware?: any[]) => {
      serverState = del(serverState, path, handler, middleware)
      return { delete: arguments.callee }
    },
    
    // Server lifecycle
    listen: async () => {
      serverState = await startServer(serverState)
      console.log(`🚀 Server started on ${serverState.config.host}:${serverState.config.port}`)
    },
    
    stop: async () => {
      serverState = await stopServer(serverState)
      console.log('🛑 Server stopped')
    },
    
    // Utilities
    getMetrics: () => serverState.totalRequests,
    getHealth: () => ({ status: 'healthy', uptime: process.uptime() }),
    
    // State access (for testing)
    _getState: () => serverState
  }
}

// Example usage
export const exampleApp = () => {
  const app = createWebApp({
    port: 3000,
    host: '0.0.0.0',
    cors: {
      origin: true,
      credentials: true
    }
  })
  
  // Define routes
  app.get('/', async () => ({
    message: 'Welcome to WebServer!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  }))
  
  app.get('/api/users', async () => ({
    success: true,
    data: [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
    ]
  }))
  
  app.post('/api/users', async (req, res) => {
    const { name, email } = req.body
    
    if (!name || !email) {
      res.status = 400
      return {
        error: {
          code: 'ERR_VALIDATION_FAILED',
          message: 'Name and email are required'
        }
      }
    }
    
    res.status = 201
    return {
      success: true,
      data: {
        id: Date.now(),
        name,
        email,
        createdAt: new Date().toISOString()
      }
    }
  })
  
  app.get('/api/users/:id', async (req, res) => {
    const { id } = req.params
    
    if (id === '1') {
      return {
        success: true,
        data: { id: parseInt(id), name: 'John Doe', email: 'john@example.com' }
      }
    }
    
    res.status = 404
    return {
      error: {
        code: 'ERR_USER_NOT_FOUND',
        message: 'User not found'
      }
    }
  })
  
  app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params
    
    res.status = 204
    return null
  })
  
  return app
}

// Auto-start if this is the main module
if (import.meta.main) {
  const app = exampleApp()
  
  app.listen().catch(error => {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  })
  
  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('🛑 Shutting down server...')
    await app.stop()
    process.exit(0)
  })
  
  process.on('SIGTERM', async () => {
    console.log('🛑 Shutting down server...')
    await app.stop()
    process.exit(0)
  })
}
