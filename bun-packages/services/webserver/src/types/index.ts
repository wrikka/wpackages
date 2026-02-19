/**
 * Type definitions for WebServer framework
 */

export interface Request {
  id: string
  method: string
  url: string
  headers: Record<string, string>
  body?: any
  query: Record<string, string>
  params: Record<string, string>
  startTime: number
  ip?: string
  userAgent?: string
  path: string
  protocol: string
  hostname: string
}

export interface Response {
  status: number
  headers: Record<string, string>
  body?: any
  sent: boolean
  startTime: number
}

export type RouteHandler = (req: Request, res: Response) => Promise<any> | any

export interface MiddlewareFunction {
  (req: Request, res: Response, next: () => Promise<void>): Promise<void> | void
}

export interface Route {
  method: string
  path: string
  handler: RouteHandler
  middleware?: MiddlewareFunction[]
  priority?: number
  cache?: CacheOptions | undefined
}

export interface ServerConfig {
  port?: number
  host?: string
  cors?: CorsOptions
  rateLimit?: RateLimitConfig
  compression?: boolean | CompressionOptions
  ssl?: SSLConfig
  logger?: LoggerConfig
  cache?: CacheConfig
  storage?: StorageConfig
  security?: SecurityConfig
  performance?: PerformanceConfig
  monitoring?: MonitoringConfig
}

export interface CorsOptions {
  origin?: string | string[] | boolean
  methods?: string[]
  allowedHeaders?: string[]
  exposedHeaders?: string[]
  credentials?: boolean
  maxAge?: number
  preflightContinue?: boolean
  optionsSuccessStatus?: number
}

export interface RateLimitConfig {
  windowMs: number
  max: number
  message?: string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  keyGenerator?: (req: Request) => string
  skip?: (req: Request) => boolean
}

export interface CompressionOptions {
  level?: number
  threshold?: number
  chunkSize?: number
  windowBits?: number
  memLevel?: number
  strategy?: number
}

export interface SSLConfig {
  key: string
  cert: string
  ca?: string
  passphrase?: string
  rejectUnauthorized?: boolean
  requestCert?: boolean
}

export interface LoggerConfig {
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal'
  format: 'json' | 'text' | 'structured'
  file?: string
  maxFiles?: number
  maxSize?: string
  datePattern?: string
  console?: boolean
  colorize?: boolean
}

export interface CacheConfig {
  type: 'memory' | 'redis' | 'file' | 'hybrid'
  ttl: number
  maxSize?: number
  maxAge?: number
  redis?: RedisConfig
  file?: FileCacheConfig
  hybrid?: HybridCacheConfig
  compression?: boolean
  encryption?: boolean
}

export interface RedisConfig {
  host: string
  port: number
  password?: string
  db?: number
  keyPrefix?: string
  connectTimeout?: number
  lazyConnect?: boolean
  maxRetriesPerRequest?: number
}

export interface FileCacheConfig {
  path: string
  maxFiles?: number
  maxFileSize?: string
  cleanupInterval?: number
  subdirs?: boolean
}

export interface HybridCacheConfig {
  memory: {
    maxSize: number
    ttl: number
  }
  persistent: {
    type: 'redis' | 'file'
    config: RedisConfig | FileCacheConfig
  }
  syncInterval?: number
}

export interface StorageConfig {
  type: 'memory' | 'file' | 'redis' | 'database' | 's3' | 'hybrid'
  default?: string
  redis?: RedisConfig
  file?: {
    path: string
    encryption?: boolean
  }
  database?: {
    connectionString: string
    table?: string
  }
  s3?: {
    bucket: string
    region: string
    accessKeyId: string
    secretAccessKey: string
    endpoint?: string
  }
  hybrid?: {
    memory: {
      maxSize: number
    }
    persistent: {
      type: 'file' | 'redis' | 's3'
      config: any
    }
  }
}

export interface SecurityConfig {
  helmet?: boolean | HelmetOptions
  csrf?: boolean | CsrfOptions
  xss?: boolean | XssOptions
  sqlInjection?: boolean | SqlInjectionOptions
  authentication?: AuthenticationConfig
  authorization?: AuthorizationConfig
}

export interface HelmetOptions {
  contentSecurityPolicy?: any
  crossOriginEmbedderPolicy?: boolean
  crossOriginOpenerPolicy?: boolean
  crossOriginResourcePolicy?: boolean
  dnsPrefetchControl?: boolean
  frameguard?: boolean | { action: 'deny' | 'sameorigin' | 'allow-from' }
  hidePoweredBy?: boolean
  hsts?: boolean | HstsOptions
  ieNoOpen?: boolean
  noSniff?: boolean
  originAgentCluster?: boolean
  permittedCrossDomainPolicies?: boolean
  referrerPolicy?: boolean | { policy: string }
  xssFilter?: boolean
}

export interface HstsOptions {
  maxAge: number
  includeSubDomains?: boolean
  preload?: boolean
}

export interface CsrfOptions {
  secret?: string
  cookie?: boolean | CookieOptions
  ignoreMethods?: string[]
  value?: (req: Request) => string
}

export interface CookieOptions {
  key?: string
  path?: string
  secure?: boolean
  httpOnly?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
  domain?: string
}

export interface XssOptions {
  whitelist?: string[]
  strip?: boolean
  escape?: boolean
}

export interface SqlInjectionOptions {
  whitelist?: string[]
  block?: boolean
  sanitize?: boolean
}

export interface AuthenticationConfig {
  type: 'jwt' | 'basic' | 'bearer' | 'oauth' | 'session'
  jwt?: JwtOptions
  basic?: BasicOptions
  oauth?: OAuthOptions
  session?: SessionOptions
}

export interface JwtOptions {
  secret: string
  algorithm?: string
  expiresIn?: string | number
  issuer?: string
  audience?: string
  headerName?: string
}

export interface BasicOptions {
  users?: Record<string, string>
  challenge?: boolean
  realm?: string
}

export interface OAuthOptions {
  provider: string
  clientId: string
  clientSecret: string
  scope?: string[]
  callbackUrl?: string
}

export interface SessionOptions {
  store?: 'memory' | 'redis' | 'file' | 'database'
  secret?: string
  resave?: boolean
  saveUninitialized?: boolean
  rolling?: boolean
  cookie?: CookieOptions
  name?: string
  genid?: () => string
}

export interface AuthorizationConfig {
  rbac?: RbacConfig
  acl?: AclConfig
}

export interface RbacConfig {
  roles: Record<string, string[]>
  defaultRole?: string
  roleKey?: string
}

export interface AclConfig {
  rules: AclRule[]
  defaultPolicy?: 'allow' | 'deny'
}

export interface AclRule {
  resource: string
  actions: string[]
  subjects: string[]
  effect: 'allow' | 'deny'
  conditions?: Record<string, any>
}

export interface PerformanceConfig {
  keepAliveTimeout?: number
  headersTimeout?: number
  requestTimeout?: number
  maxConnections?: number
  maxRequestsPerConnection?: number
  compression?: CompressionOptions
  bodyLimit?: string | number
  parameterLimit?: number
  trustProxy?: boolean | string[]
}

export interface MonitoringConfig {
  enabled?: boolean
  metrics?: MetricsConfig
  healthCheck?: HealthCheckConfig
  profiling?: ProfilingConfig
  tracing?: TracingConfig
}

export interface MetricsConfig {
  enabled?: boolean
  endpoint?: string
  collectDefaultMetrics?: boolean
  customMetrics?: CustomMetric[]
}

export interface CustomMetric {
  name: string
  type: 'counter' | 'gauge' | 'histogram' | 'summary'
  help: string
  labelNames?: string[]
}

export interface HealthCheckConfig {
  enabled?: boolean
  endpoint?: string
  checks?: HealthCheckFunction[]
  timeout?: number
  interval?: number
}

export type HealthCheckFunction = () => Promise<HealthCheckResult>

export interface HealthCheckResult {
  status: 'pass' | 'fail' | 'warn'
  message?: string
  duration?: number
  metadata?: Record<string, any>
}

export interface ProfilingConfig {
  enabled?: boolean
  sampleRate?: number
  maxSamples?: number
  outputPath?: string
}

export interface TracingConfig {
  enabled?: boolean
  serviceName?: string
  serviceVersion?: string
  endpoint?: string
  sampleRate?: number
  headers?: Record<string, string>
}

export interface CacheOptions {
  ttl?: number
  key?: string
  tags?: string[]
  compression?: boolean
  encryption?: boolean
  vary?: string[]
}

export interface CacheEntry<T = any> {
  key: string
  value: T
  expires: number
  hits: number
  createdAt: number
  lastAccessed: number
  size: number
  tags?: string[]
  compressed?: boolean
  encrypted?: boolean
}

export interface StorageEntry<T = any> {
  key: string
  value: T
  namespace?: string
  createdAt: number
  updatedAt: number
  size: number
  metadata?: Record<string, any>
}

export interface LogEntry {
  timestamp: string
  level: string
  message: string
  requestId?: string
  method?: string
  url?: string
  status?: number
  duration?: number
  error?: string
  stack?: string
  metadata?: Record<string, any>
  tags?: string[]
}

export interface PerformanceMetrics {
  requestsPerSecond: number
  averageResponseTime: number
  errorRate: number
  memoryUsage: number
  cpuUsage: number
  activeConnections: number
  totalRequests: number
  totalErrors: number
  uptime: number
  timestamp: number
}

export interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  uptime: number
  version: string
  checks: Record<string, {
    status: 'pass' | 'fail' | 'warn'
    message?: string
    duration?: number
    metadata?: Record<string, any>
  }>
  metrics?: PerformanceMetrics
}

export interface RouteMatch {
  handler: RouteHandler
  params: Record<string, string>
  middleware: MiddlewareFunction[]
  cache?: CacheOptions | undefined
  priority: number
}

export interface ServerMetrics {
  startTime: number
  totalRequests: number
  totalErrors: number
  activeConnections: number
  memoryUsage: NodeJS.MemoryUsage
  cpuUsage: NodeJS.CpuUsage
  requestsPerSecond: number
  averageResponseTime: number
  errorRate: number
}

export interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: any
    stack?: string
    timestamp: string
    requestId: string
  }
}

export interface SuccessResponse<T = any> {
  success: true
  data: T
  meta?: {
    pagination?: PaginationMeta
    timestamp: string
    requestId: string
    version: string
  }
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// Enhanced types for functional programming
export type Effect<T> = () => Promise<T>
export type PureFunction<T, R> = (input: T) => R
export type AsyncPureFunction<T, R> = (input: T) => Promise<R>
export type MiddlewareChain = MiddlewareFunction[]
export type RouteMap = Map<string, Route[]>
export type CacheMap = Map<string, CacheEntry>
export type StorageMap = Map<string, StorageEntry>
