export interface BulkheadConfig {
	readonly maxConcurrent: number;
	readonly maxQueueSize: number;
}

export interface RateLimiterConfig {
	readonly maxRequests: number;
	readonly windowMs: number;
}

export interface BulkheadMetrics {
	readonly activeRequests: number;
	readonly queuedRequests: number;
	readonly rejectedRequests: number;
}
