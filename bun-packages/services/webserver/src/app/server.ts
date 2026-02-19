/**
 * Server application - Functional approach
 */

import { serve } from 'bun'
import { randomUUID } from 'crypto'
import { performance } from 'perf_hooks'
import type { 
  Request, 
  Response, 
  ServerConfig,
  PerformanceMetrics,
  HealthCheck
} from '../types'
import { createRequest, createResponse, updateResponse } from '../lib/core'
import { createRequestId, getClientIp, getUserAgent } from '../utils'
import { createRouterState, handleRequest } from '../services/router'
import { createCacheState, cleanup, shouldCleanup } from '../services/cache'

// Server state
type ServerState = {
  config: Required<ServerConfig>
  router: ReturnType<typeof createRouterState>
  cache: ReturnType<typeof createCacheState>
  startTime: number
  totalRequests: number
  totalErrors: number
  activeConnections: number
  isRunning: boolean
  server?: any
}

// Configuration merger
const mergeConfig = (config: ServerConfig): Required<ServerConfig> => ({
  port: config.port ?? 3000,
  host: config.host ?? '0.0.0.0',
  cors: config.cors ?? { origin: true },
  rateLimit: config.rateLimit ?? { windowMs: 60000, max: 100 },
  compression: config.compression ?? true,
  ssl: config.ssl,
  logger: config.logger ?? { level: 'info', format: 'json', console: true },
  cache: config.cache ?? { type: 'memory', ttl: 300000 },
  storage: config.storage ?? { type: 'memory' },
  security: config.security ?? {},
  performance: config.performance ?? {},
  monitoring: config.monitoring ?? { enabled: true }
})

// Initial state
export const createServerState = (config: ServerConfig): ServerState => ({
  config: mergeConfig(config),
  router: createRouterState(),
  cache: createCacheState(config.cache ?? { type: 'memory', ttl: 300000 }),
  startTime: Date.now(),
  totalRequests: 0,
  totalErrors: 0,
  activeConnections: 0,
  isRunning: false
})

// Pure functions for server operations
export const startServer = async (state: ServerState): Promise<ServerState> => {
  if (state.isRunning) {
    throw new Error('Server is already running')
  }

  try {
    const server = serve({
      port: state.config.port,
      hostname: state.config.host,
      fetch: (request) => handleIncomingRequest(state, request),
      tls: state.config.ssl
    })

    return {
      ...state,
      server,
      isRunning: true
    }
  } catch (error) {
    throw new Error(`Failed to start server: ${error.message}`)
  }
}

export const stopServer = async (state: ServerState): Promise<ServerState> => {
  if (!state.isRunning || !state.server) {
    return state
  }

  try {
    state.server.stop()
    
    return {
      ...state,
      server: undefined,
      isRunning: false
    }
  } catch (error) {
    throw new Error(`Failed to stop server: ${error.message}`)
  }
}

export const handleIncomingRequest = async (
  state: ServerState,
  request: Request
): Promise<Response> => {
  const startTime = performance.now()
  const requestId = createRequestId()
  
  try {
    // Create request object
    const url = new URL(request.url)
    let body
    
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        const text = await request.text()
        if (request.headers.get('content-type')?.includes('application/json')) {
          body = JSON.parse(text)
        } else {
          body = text
        }
      } catch {
        // Ignore parsing errors
      }
    }
    
    const req = createRequest(
      requestId,
      request.method,
      request.url,
      Object.fromEntries(request.headers.entries()),
      body,
      Object.fromEntries(url.searchParams.entries()),
      {}
    )
    
    // Add additional request properties
    req.ip = getClientIp(request)
    req.userAgent = getUserAgent(request)
    
    // Create response object
    const res = createResponse()
    
    // Update connection count
    state.activeConnections++
    state.totalRequests++
    
    // Handle the request
    await handleRequest(state.router, req, res)
    
    // Update connection count
    state.activeConnections--
    
    // Calculate metrics
    const duration = performance.now() - startTime
    
    if (res.status >= 400) {
      state.totalErrors++
    }
    
    // Log request (if configured)
    if (state.config.logger.console) {
      console.log(`${request.method} ${url.pathname} - ${res.status} - ${Math.round(duration)}ms`)
    }
    
    // Create final response
    return new Response(
      JSON.stringify(res.body),
      {
        status: res.status,
        headers: {
          ...res.headers,
          'content-type': 'application/json',
          'x-request-id': requestId,
          'x-response-time': `${Math.round(duration)}ms`
        }
      }
    )
    
  } catch (error) {
    state.activeConnections--
    state.totalErrors++
    
    const duration = performance.now() - startTime
    
    console.error('Request failed:', {
      requestId,
      method: request.method,
      url: request.url,
      error: error.message,
      duration: Math.round(duration)
    })
    
    return new Response(
      JSON.stringify({
        error: {
          code: 'ERR_INTERNAL_SERVER_ERROR',
          message: 'Internal server error',
          requestId,
          timestamp: new Date().toISOString()
        }
      }),
      {
        status: 500,
        headers: {
          'content-type': 'application/json',
          'x-request-id': requestId
        }
      }
    )
  }
}

// Metrics and health checks
export const getMetrics = (state: ServerState): PerformanceMetrics => {
  const uptime = Date.now() - state.startTime
  const requestsPerSecond = state.totalRequests / (uptime / 1000)
  const errorRate = state.totalRequests > 0 ? (state.totalErrors / state.totalRequests) * 100 : 0
  
  return {
    requestsPerSecond,
    averageResponseTime: 0, // Would need to track individual request times
    errorRate,
    memoryUsage: process.memoryUsage().heapUsed,
    cpuUsage: 0, // Would need to track CPU usage
    activeConnections: state.activeConnections,
    totalRequests: state.totalRequests,
    totalErrors: state.totalErrors,
    uptime,
    timestamp: Date.now()
  }
}

export const getHealth = (state: ServerState): HealthCheck => {
  const metrics = getMetrics(state)
  const memUsage = process.memoryUsage()
  const memUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100
  
  const checks = {
    memory: {
      status: memUsagePercent > 90 ? 'fail' as const : memUsagePercent > 80 ? 'warn' as const : 'pass' as const,
      message: `Memory usage: ${memUsagePercent.toFixed(2)}%`,
      metadata: { usage: memUsage }
    },
    uptime: {
      status: process.uptime() > 0 ? 'pass' as const : 'fail' as const,
      message: `Uptime: ${process.uptime().toFixed(2)}s`,
      metadata: { uptime: process.uptime() }
    }
  }
  
  return {
    status: Object.values(checks).every(c => c.status === 'pass') ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    checks,
    metrics
  }
}

// Server lifecycle management
export const performMaintenance = (state: ServerState): ServerState => {
  let updatedState = state
  
  // Cleanup cache if needed
  if (shouldCleanup(state.cache)) {
    updatedState = {
      ...updatedState,
      cache: cleanup(state.cache)
    }
  }
  
  return updatedState
}

// Server factory
export const createServer = (config: ServerConfig): ServerState => {
  const state = createServerState(config)
  
  // Setup health check endpoint
  state.router = handleRequest(
    state.router,
    createRequest('health', 'GET', '/health', {}),
    createResponse()
  )
  
  return state
}
