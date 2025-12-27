import { DEFAULT_RETRY_CONFIG, RETRYABLE_STATUS_CODES } from "../constant";
import type { RetryConfig } from "../types";

/**
 * Retry utilities - Pure functions
 */

/**
 * Calculate delay for retry attempt
 * Uses exponential backoff with jitter
 */
export const calculateRetryDelay = (
	attempt: number,
	initialDelay: number = DEFAULT_RETRY_CONFIG.initialDelay,
	factor: number = DEFAULT_RETRY_CONFIG.factor,
	maxDelay: number = DEFAULT_RETRY_CONFIG.maxDelay,
): number => {
	const exponentialDelay = initialDelay * factor ** (attempt - 1);
	const cappedDelay = Math.min(exponentialDelay, maxDelay);

	// Add jitter (random value between 0 and 20% of delay)
	const jitter = cappedDelay * 0.2 * Math.random();

	return Math.floor(cappedDelay + jitter);
};

/**
 * Check if status code is retryable
 */
export const isRetryableStatus = (
	statusCode: number,
	retryableStatuses?: readonly number[],
): boolean => {
	const statuses = retryableStatuses || RETRYABLE_STATUS_CODES;
	return statuses.includes(statusCode);
};

/**
 * Check if should retry based on attempt number
 */
export const shouldRetry = (
	attempt: number,
	maxAttempts: number = DEFAULT_RETRY_CONFIG.maxAttempts,
): boolean => {
	return attempt < maxAttempts;
};

/**
 * Build retry config with defaults
 */
export const buildRetryConfig = (
	partial?: Partial<RetryConfig>,
): RetryConfig => ({
	...DEFAULT_RETRY_CONFIG,
	...partial,
});
