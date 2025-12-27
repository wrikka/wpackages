/**
 * Retry Strategy - Pure functions for retry logic and backoff strategies
 */

/**
 * Retry configuration
 */
export interface RetryConfig {
	readonly maxAttempts: number;
	readonly initialDelayMs: number;
	readonly maxDelayMs: number;
	readonly backoffMultiplier: number;
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
	maxAttempts: 3,
	initialDelayMs: 1000,
	maxDelayMs: 30000,
	backoffMultiplier: 2,
};

/**
 * Calculate exponential backoff delay
 */
export const calculateBackoffDelay = (
	attempt: number,
	config: RetryConfig,
): number => {
	const delay = config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt - 1);
	return Math.min(delay, config.maxDelayMs);
};

/**
 * Calculate delay with jitter (randomization)
 */
export const calculateBackoffWithJitter = (
	attempt: number,
	config: RetryConfig,
): number => {
	const delay = calculateBackoffDelay(attempt, config);
	const jitter = Math.random() * delay * 0.1; // 10% jitter
	return delay + jitter;
};

/**
 * Linear backoff strategy
 */
export const calculateLinearBackoff = (
	attempt: number,
	config: RetryConfig,
): number => {
	const delay = config.initialDelayMs * attempt;
	return Math.min(delay, config.maxDelayMs);
};

/**
 * Check if should retry based on error
 */
export const shouldRetry = (
	error: unknown,
	attempt: number,
	config: RetryConfig,
): boolean => {
	if (attempt >= config.maxAttempts) {
		return false;
	}

	// Retry on network errors, timeouts, and 5xx errors
	if (error instanceof Error) {
		const message = error.message.toLowerCase();
		return (
			message.includes("timeout") ||
			message.includes("network") ||
			message.includes("econnrefused") ||
			message.includes("econnreset")
		);
	}

	return false;
};

/**
 * Create retry attempts array
 */
export const createRetryAttempts = (
	config: RetryConfig,
): readonly number[] => {
	const attempts: number[] = [];
	for (let i = 1; i <= config.maxAttempts; i++) {
		attempts.push(i);
	}
	return attempts;
};

/**
 * Get retry metadata
 */
export const getRetryMetadata = (
	attempt: number,
	config: RetryConfig,
): {
	attempt: number;
	maxAttempts: number;
	delay: number;
	isLastAttempt: boolean;
} => ({
	attempt,
	maxAttempts: config.maxAttempts,
	delay: calculateBackoffDelay(attempt, config),
	isLastAttempt: attempt === config.maxAttempts,
});

/**
 * Determine if error is retryable
 */
export const isRetryableError = (error: unknown): boolean => {
	if (error instanceof Error) {
		const message = error.message.toLowerCase();
		const retryablePatterns = [
			"timeout",
			"network",
			"econnrefused",
			"econnreset",
			"etimedout",
			"ehostunreach",
			"enetunreach",
			"503", // Service unavailable
			"429", // Too many requests
			"500", // Internal server error
			"502", // Bad gateway
			"504", // Gateway timeout
		];

		return retryablePatterns.some((pattern) => message.includes(pattern));
	}

	return false;
};
