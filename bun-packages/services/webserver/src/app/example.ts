/**
 * Example usage of WebServer framework
 */

import { WebServer } from './index'
import { Middleware } from './middleware'

// Create server instance
const server = new WebServer({
  port: 3000,
  host: '0.0.0.0',
  cors: {
    origin: ['http://localhost:3000', 'https://example.com'],
    credentials: true
  },
  rateLimit: {
    windowMs: 60000, // 1 minute
    max: 100, // 100 requests per minute
    message: 'Too many requests from this IP'
  },
  compression: true,
  logger: {
    level: 'info',
    format: 'json',
    console: true,
    colorize: true
  },
  cache: {
    type: 'memory',
    ttl: 300000, // 5 minutes
    maxSize: 1000
  },
  storage: {
    type: 'memory'
  },
  security: {
    helmet: true,
    csrf: false,
    xss: true,
    sqlInjection: true
  },
  monitoring: {
    enabled: true,
    metrics: {
      enabled: true,
      endpoint: '/metrics',
      collectDefaultMetrics: true
    },
    healthCheck: {
      enabled: true,
      endpoint: '/health',
      timeout: 5000
    }
  }
})

// Apply global middleware
server.use('/', [
  Middleware.requestId(),
  Middleware.trustProxy(),
  Middleware.logger(),
  Middleware.cors(),
  Middleware.rateLimit({ windowMs: 60000, max: 100 }),
  Middleware.compression(),
  Middleware.security(),
  Middleware.bodyParser({ limit: '10mb' })
])

// Basic routes
server.get('/', async () => {
  return {
    message: 'Welcome to WebServer!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  }
})

server.get('/api/users', async (req, res) => {
  // Simulate database query
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ]
  
  return {
    success: true,
    data: users,
    meta: {
      total: users.length,
      page: 1,
      limit: 10
    }
  }
})

server.post('/api/users', async (req, res) => {
  const { name, email } = req.body
  
  // Validate input
  if (!name || !email) {
    res.status = 400
    return {
      error: {
        code: 'ERR_VALIDATION_FAILED',
        message: 'Name and email are required'
      }
    }
  }
  
  // Simulate creating user
  const newUser = {
    id: Date.now(),
    name,
    email,
    createdAt: new Date().toISOString()
  }
  
  res.status = 201
  return {
    success: true,
    data: newUser
  }
})

server.get('/api/users/:id', async (req, res) => {
  const { id } = req.params
  
  // Simulate database query
  const user = { id: parseInt(id), name: 'John Doe', email: 'john@example.com' }
  
  if (!user) {
    res.status = 404
    return {
      error: {
        code: 'ERR_USER_NOT_FOUND',
        message: 'User not found'
      }
    }
  }
  
  return {
    success: true,
    data: user
  }
})

// Routes with caching
server.get('/api/posts', async (req, res) => {
  // This route will be cached for 5 minutes
  const posts = [
    { id: 1, title: 'First Post', content: 'This is the first post' },
    { id: 2, title: 'Second Post', content: 'This is the second post' }
  ]
  
  return {
    success: true,
    data: posts
  }
}, [Middleware.cache({ ttl: 300000 })])

// Routes with authentication
server.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body
  
  // Simulate authentication
  if (email === 'admin@example.com' && password === 'password') {
    const token = 'mock-jwt-token'
    
    return {
      success: true,
      data: {
        token,
        user: {
          id: 1,
          email,
          name: 'Admin User'
        }
      }
    }
  }
  
  res.status = 401
  return {
    error: {
      code: 'ERR_INVALID_CREDENTIALS',
      message: 'Invalid email or password'
    }
  }
})

// Protected routes
server.get('/api/profile', async (req, res) => {
  // This route would require authentication
  return {
    success: true,
    data: {
      id: 1,
      email: 'user@example.com',
      name: 'John Doe'
    }
  }
}, [Middleware.jwt('your-secret-key')])

// Error handling
server.get('/api/error', async () => {
  throw new Error('This is a test error')
})

// File-based routing example
// server.loadRoutes('./routes')

// Start server
server.listen().then(() => {
  console.log('🚀 WebServer started successfully!')
  console.log('📊 Metrics available at: http://localhost:3000/metrics')
  console.log('🏥 Health check available at: http://localhost:3000/health')
}).catch(error => {
  console.error('❌ Failed to start server:', error)
})

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down server...')
  await server.stop()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down server...')
  await server.stop()
  process.exit(0)
})
