/**
 * Performance monitoring service - Functional approach
 */

import { performance } from 'perf_hooks'
import type { 
  MonitoringConfig, 
  PerformanceMetrics, 
  CustomMetric,
  HealthCheckResult
} from '../types'

// Monitoring state
type MonitoringState = {
  config: Required<MonitoringConfig>
  metrics: Map<string, any>
  requestTimes: number[]
  errorCounts: Map<string, number>
  startTime: number
  totalRequests: number
  totalErrors: number
  activeConnections: number
  collectInterval?: NodeJS.Timeout
}

// Configuration merger
const mergeConfig = (config: MonitoringConfig): Required<MonitoringConfig> => ({
  enabled: config.enabled ?? true,
  metrics: {
    enabled: config.metrics?.enabled ?? true,
    endpoint: config.metrics?.endpoint ?? '/metrics',
    collectDefaultMetrics: config.metrics?.collectDefaultMetrics ?? true,
    customMetrics: config.metrics?.customMetrics ?? []
  },
  healthCheck: {
    enabled: config.healthCheck?.enabled ?? true,
    endpoint: config.healthCheck?.endpoint ?? '/health',
    checks: config.healthCheck?.checks ?? [],
    timeout: config.healthCheck?.timeout ?? 5000,
    interval: config.healthCheck?.interval ?? 30000
  },
  profiling: {
    enabled: config.profiling?.enabled ?? false,
    sampleRate: config.profiling?.sampleRate ?? 0.1,
    maxSamples: config.profiling?.maxSamples ?? 1000,
    outputPath: config.profiling?.outputPath ?? './profiling'
  },
  tracing: {
    enabled: config.tracing?.enabled ?? false,
    serviceName: config.tracing?.serviceName ?? 'webserver',
    serviceVersion: config.tracing?.serviceVersion ?? '1.0.0',
    endpoint: config.tracing?.endpoint,
    sampleRate: config.tracing?.sampleRate ?? 0.1,
    headers: config.tracing?.headers ?? {}
  }
})

// Initial state
export const createMonitoringState = (config: MonitoringConfig): MonitoringState => ({
  config: mergeConfig(config),
  metrics: new Map(),
  requestTimes: [],
  errorCounts: new Map(),
  startTime: Date.now(),
  totalRequests: 0,
  totalErrors: 0,
  activeConnections: 0
})

// Initialize metrics
const initializeMetrics = (config: Required<MonitoringConfig>): Map<string, any> => {
  const metrics = new Map()
  
  // Initialize default metrics
  metrics.set('http_requests_total', {
    type: 'counter',
    help: 'Total number of HTTP requests',
    value: 0,
    labels: ['method', 'route', 'status']
  })

  metrics.set('http_request_duration_seconds', {
    type: 'histogram',
    help: 'HTTP request duration in seconds',
    value: [],
    labels: ['method', 'route', 'status']
  })

  metrics.set('http_errors_total', {
    type: 'counter',
    help: 'Total number of HTTP errors',
    value: 0,
    labels: ['method', 'route', 'status']
  })

  metrics.set('active_connections', {
    type: 'gauge',
    help: 'Number of active connections',
    value: 0
  })

  metrics.set('memory_usage_bytes', {
    type: 'gauge',
    help: 'Memory usage in bytes',
    value: 0,
    labels: ['type']
  })

  metrics.set('cpu_usage_percent', {
    type: 'gauge',
    help: 'CPU usage percentage',
    value: 0
  })

  // Initialize custom metrics
  for (const customMetric of config.metrics.customMetrics) {
    metrics.set(customMetric.name, {
      type: customMetric.type,
      help: customMetric.help,
      value: customMetric.type === 'counter' ? 0 : 
            customMetric.type === 'gauge' ? 0 : 
            customMetric.type === 'histogram' ? [] : {},
      labels: customMetric.labelNames || []
    })
  }
  
  return metrics
}

// Pure functions for monitoring
export const recordRequest = (
  state: MonitoringState,
  method: string,
  route: string,
  status: number,
  duration: number
): MonitoringState => {
  if (!state.config.enabled) {
    return state
  }

  const newRequestTimes = [...state.requestTimes, duration]
  
  // Keep only last 1000 request times for calculation
  if (newRequestTimes.length > 1000) {
    newRequestTimes.shift()
  }

  const newTotalRequests = state.totalRequests + 1
  const newTotalErrors = status >= 400 ? state.totalErrors + 1 : state.totalErrors

  // Update metrics
  const newMetrics = new Map(state.metrics)
  incrementCounter(newMetrics, 'http_requests_total', [method, route, status.toString()])
  recordHistogram(newMetrics, 'http_request_duration_seconds', duration / 1000, [method, route, status.toString()])

  if (status >= 400) {
    incrementCounter(newMetrics, 'http_errors_total', [method, route, status.toString()])
    
    const errorKey = `${method}:${route}:${status}`
    const currentCount = state.errorCounts.get(errorKey) || 0
    const newErrorCounts = new Map(state.errorCounts)
    newErrorCounts.set(errorKey, currentCount + 1)
    
    return {
      ...state,
      requestTimes: newRequestTimes,
      totalRequests: newTotalRequests,
      totalErrors: newTotalErrors,
      errorCounts: newErrorCounts,
      metrics: newMetrics
    }
  }

  return {
    ...state,
    requestTimes: newRequestTimes,
    totalRequests: newTotalRequests,
    totalErrors: newTotalErrors,
    metrics: newMetrics
  }
}

export const recordError = (state: MonitoringState, error: Error): MonitoringState => {
  if (!state.config.enabled) {
    return state
  }

  const newTotalErrors = state.totalErrors + 1
  const errorKey = error.name || 'UnknownError'
  const currentCount = state.errorCounts.get(errorKey) || 0
  const newErrorCounts = new Map(state.errorCounts)
  newErrorCounts.set(errorKey, currentCount + 1)

  return {
    ...state,
    totalErrors: newTotalErrors,
    errorCounts: newErrorCounts
  }
}

export const incrementCounter = (metrics: Map<string, any>, name: string, labels?: string[]): void => {
  const metric = metrics.get(name)
  if (metric && metric.type === 'counter') {
    metric.value++
  }
}

export const setGauge = (metrics: Map<string, any>, name: string, value: number, labels?: string[]): void => {
  const metric = metrics.get(name)
  if (metric && metric.type === 'gauge') {
    metric.value = value
  }
}

export const recordHistogram = (metrics: Map<string, any>, name: string, value: number, labels?: string[]): void => {
  const metric = metrics.get(name)
  if (metric && metric.type === 'histogram') {
    metric.value.push(value)
    
    // Keep only last 1000 values
    if (metric.value.length > 1000) {
      metric.value.shift()
    }
  }
}

export const getMetrics = (state: MonitoringState): PerformanceMetrics => {
  const uptime = Date.now() - state.startTime
  const requestsPerSecond = state.totalRequests / (uptime / 1000)
  const averageResponseTime = state.requestTimes.length > 0 
    ? state.requestTimes.reduce((a, b) => a + b, 0) / state.requestTimes.length 
    : 0
  const errorRate = state.totalRequests > 0 ? (state.totalErrors / state.totalRequests) * 100 : 0

  // Update memory and CPU metrics
  const memUsage = process.memoryUsage()
  setGauge(state.metrics, 'memory_usage_bytes', memUsage.heapUsed, ['heap'])
  setGauge(state.metrics, 'memory_usage_bytes', memUsage.heapTotal, ['heap_total'])
  setGauge(state.metrics, 'memory_usage_bytes', memUsage.rss, ['rss'])
  setGauge(state.metrics, 'memory_usage_bytes', memUsage.external, ['external'])

  const cpuUsage = process.cpuUsage()
  const cpuPercent = (cpuUsage.user + cpuUsage.system) / 1000000 * 100 // Convert to percentage
  setGauge(state.metrics, 'cpu_usage_percent', cpuPercent)

  setGauge(state.metrics, 'active_connections', state.activeConnections)

  return {
    requestsPerSecond,
    averageResponseTime,
    errorRate,
    memoryUsage: memUsage.heapUsed,
    cpuUsage: cpuPercent,
    activeConnections: state.activeConnections,
    totalRequests: state.totalRequests,
    totalErrors: state.totalErrors,
    uptime,
    timestamp: Date.now()
  }
}

export const getPrometheusMetrics = (state: MonitoringState): string => {
  const lines: string[] = []

  for (const [name, metric] of state.metrics.entries()) {
    lines.push(`# HELP ${metric.help}`)
    lines.push(`# TYPE ${name} ${metric.type}`)

    if (metric.type === 'counter' || metric.type === 'gauge') {
      lines.push(`${name} ${metric.value}`)
    } else if (metric.type === 'histogram') {
      const values = metric.value as number[]
      if (values.length > 0) {
        const sum = values.reduce((a, b) => a + b, 0)
        const count = values.length
        
        lines.push(`${name}_sum ${sum}`)
        lines.push(`${name}_count ${count}`)
        
        // Add buckets
        const buckets = [0.1, 0.5, 1, 2, 5, 10]
        for (const bucket of buckets) {
          const bucketCount = values.filter(v => v <= bucket).length
          lines.push(`${name}_bucket{le="${bucket}"} ${bucketCount}`)
        }
        lines.push(`${name}_bucket{le="+Inf"} ${count}`)
      }
    }
  }

  return lines.join('\n')
}

export const performHealthChecks = async (state: MonitoringState): Promise<Record<string, HealthCheckResult>> => {
  const results: Record<string, HealthCheckResult> = {}

  // Default health checks
  results.memory = checkMemory()
  results.cpu = checkCPU()
  results.uptime = checkUptime()

  // Custom health checks
  for (const check of state.config.healthCheck.checks) {
    try {
      const startTime = performance.now()
      const result = await Promise.race([
        check(),
        new Promise<HealthCheckResult>((_, reject) => 
          setTimeout(() => reject(new Error('Health check timeout')), state.config.healthCheck.timeout)
        )
      ])
      const duration = performance.now() - startTime
      
      results[check.name || 'custom'] = {
        ...result,
        duration
      }
    } catch (error) {
      results[check.name || 'custom'] = {
        status: 'fail',
        message: error.message,
        duration: state.config.healthCheck.timeout
      }
    }
  }

  return results
}

const checkMemory = (): HealthCheckResult => {
  const memUsage = process.memoryUsage()
  const usagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100
  
  return {
    status: usagePercent > 90 ? 'fail' : usagePercent > 80 ? 'warn' : 'pass',
    message: `Memory usage: ${usagePercent.toFixed(2)}%`,
    metadata: { usage: memUsage }
  }
}

const checkCPU = (): HealthCheckResult => {
  const cpuUsage = process.cpuUsage()
  const cpuPercent = (cpuUsage.user + cpuUsage.system) / 1000000 * 100
  
  return {
    status: cpuPercent > 90 ? 'fail' : cpuPercent > 80 ? 'warn' : 'pass',
    message: `CPU usage: ${cpuPercent.toFixed(2)}%`,
    metadata: { usage: cpuUsage }
  }
}

const checkUptime = (): HealthCheckResult => {
  const uptime = process.uptime()
  
  return {
    status: uptime > 0 ? 'pass' : 'fail',
    message: `Uptime: ${uptime.toFixed(2)}s`,
    metadata: { uptime }
  }
}

export const incrementActiveConnections = (state: MonitoringState): MonitoringState => {
  const newActiveConnections = state.activeConnections + 1
  setGauge(state.metrics, 'active_connections', newActiveConnections)
  
  return {
    ...state,
    activeConnections: newActiveConnections
  }
}

export const decrementActiveConnections = (state: MonitoringState): MonitoringState => {
  const newActiveConnections = Math.max(0, state.activeConnections - 1)
  setGauge(state.metrics, 'active_connections', newActiveConnections)
  
  return {
    ...state,
    activeConnections: newActiveConnections
  }
}

// Monitoring factory
export const createMonitoring = (config: MonitoringConfig): MonitoringState => {
  const state = createMonitoringState(config)
  return {
    ...state,
    metrics: initializeMetrics(state.config)
  }
}

// Monitoring lifecycle
export const startMonitoring = (state: MonitoringState): MonitoringState => {
  if (!state.config.enabled) {
    return state
  }

  // Start collecting default metrics
  const collectInterval = setInterval(() => {
    collectSystemMetrics(state)
  }, 5000) // Collect every 5 seconds

  return {
    ...state,
    collectInterval
  }
}

export const stopMonitoring = (state: MonitoringState): MonitoringState => {
  if (state.collectInterval) {
    clearInterval(state.collectInterval)
  }

  return {
    ...state,
    collectInterval: undefined
  }
}

const collectSystemMetrics = (state: MonitoringState): void => {
  // Collect system metrics
  const memUsage = process.memoryUsage()
  setGauge(state.metrics, 'memory_usage_bytes', memUsage.heapUsed, ['heap'])
  setGauge(state.metrics, 'memory_usage_bytes', memUsage.heapTotal, ['heap_total'])
  setGauge(state.metrics, 'memory_usage_bytes', memUsage.rss, ['rss'])
  setGauge(state.metrics, 'memory_usage_bytes', memUsage.external, ['external'])

  const cpuUsage = process.cpuUsage()
  const cpuPercent = (cpuUsage.user + cpuUsage.system) / 1000000 * 100
  setGauge(state.metrics, 'cpu_usage_percent', cpuPercent)
}

export const resetMetrics = (state: MonitoringState): MonitoringState => {
  const newMetrics = new Map()
  
  // Reset metrics
  for (const [name, metric] of state.metrics.entries()) {
    if (metric.type === 'counter') {
      metric.value = 0
    } else if (metric.type === 'histogram') {
      metric.value = []
    } else if (metric.type === 'gauge') {
      metric.value = 0
    }
    newMetrics.set(name, metric)
  }
  
  return {
    ...state,
    metrics: newMetrics,
    totalRequests: 0,
    totalErrors: 0,
    requestTimes: [],
    errorCounts: new Map()
  }
}
