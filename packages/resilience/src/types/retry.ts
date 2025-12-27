/**
 * Retry types
 */

export type RetryConfig = {
	enabled: boolean;
	maxRetries?: number;
	retryDelay?: number;
	exponentialBackoff?: boolean;
	maxDelay?: number;
	retryableErrors?: string[];
	onRetry?: (attempt: number, error: Error) => void;
};

export type RetryResult<T> = {
	success: boolean;
	value?: T;
	error?: Error;
	attempts: number;
	totalDuration: number;
};

export type RetryStrategy = "fixed" | "exponential" | "linear";

export type RetryOptions = {
	strategy?: RetryStrategy;
	baseDelay?: number;
	maxDelay?: number;
	maxAttempts?: number;
	shouldRetry?: (error: Error) => boolean;
	onRetry?: (attempt: number, error: Error, delay: number) => void;
};
