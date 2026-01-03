import type { RetryConfig } from "../types";

/**
 * Default configurations
 */

/**
 * Default request timeout (30 seconds)
 */
export const DEFAULT_TIMEOUT = 30_000;

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
	factor: 2,
	initialDelay: 1000,
	maxAttempts: 3,
	maxDelay: 30_000,
} as const;

/**
 * Default rate limit configuration
 */
export const DEFAULT_RATE_LIMIT = {
	maxRequests: 100,
	strategy: "sliding",
	windowMs: 60_000, // 1 minute
} as const;

/**
 * Default pagination limits
 */
export const DEFAULT_PAGINATION = {
	limit: 50,
	maxLimit: 1000,
} as const;

/**
 * Default webhook verification algorithm
 */
export const DEFAULT_WEBHOOK_ALGORITHM = "sha256" as const;

/**
 * User agent for integration requests
 */
export const DEFAULT_USER_AGENT = "integration-core/0.0.1" as const;
