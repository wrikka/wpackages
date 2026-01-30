/**
 * Integration metadata
 */
export type IntegrationMetadata = {
	readonly id: string;
	readonly name: string;
	readonly version: string;
	readonly description: string;
	readonly category: IntegrationCategory;
	readonly capabilities: readonly IntegrationCapability[];
	readonly author?: string;
	readonly homepage?: string;
	readonly documentationUrl?: string;
};

/**
 * Integration categories
 */
export type IntegrationCategory =
	| "communication"
	| "productivity"
	| "crm"
	| "marketing"
	| "payment"
	| "storage"
	| "database"
	| "analytics"
	| "developer"
	| "social"
	| "ecommerce"
	| "other";

/**
 * Integration capabilities
 */
export type IntegrationCapability =
	| "read"
	| "write"
	| "delete"
	| "webhook"
	| "realtime"
	| "batch"
	| "search"
	| "upload"
	| "download";

/**
 * Core integration interface
 */
export type Integration<TConfig = unknown, TContext = unknown> = {
	readonly metadata: IntegrationMetadata;
	readonly authenticate: (config: TConfig) => Promise<TContext>;
	readonly validateConfig: (config: unknown) => TConfig;
	readonly healthCheck: (context: TContext) => Promise<HealthStatus>;
};

/**
 * Health check status
 */
export type HealthStatus = {
	readonly healthy: boolean;
	readonly timestamp: number;
	readonly latency?: number;
	readonly details?: Record<string, unknown>;
};

/**
 * Integration errors
 */
export type IntegrationError =
	| AuthenticationError
	| RateLimitError
	| NetworkError
	| ValidationError
	| TimeoutError
	| ConfigurationError
	| UnknownError;

export type AuthenticationError = {
	readonly type: "authentication";
	readonly message: string;
	readonly code?: string;
	readonly details?: Record<string, unknown>;
};

export type RateLimitError = {
	readonly type: "rate_limit";
	readonly message: string;
	readonly retryAfter?: number;
	readonly limit?: number;
	readonly remaining?: number;
	readonly resetAt?: number;
};

export type NetworkError = {
	readonly type: "network";
	readonly message: string;
	readonly statusCode?: number;
	readonly cause?: unknown;
};

export type ValidationError = {
	readonly type: "validation";
	readonly message: string;
	readonly field?: string;
	readonly errors?: readonly string[];
};

export type TimeoutError = {
	readonly type: "timeout";
	readonly message: string;
	readonly timeout: number;
	readonly operation?: string;
};

export type ConfigurationError = {
	readonly type: "configuration";
	readonly message: string;
	readonly field?: string;
	readonly value?: unknown;
};

export type UnknownError = {
	readonly type: "unknown";
	readonly message: string;
	readonly cause?: unknown;
};
