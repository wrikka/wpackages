/**
 * Retry service implementation
 */

import { Effect } from "effect";
import type { RetryConfig, RetryOptions, RetryResult } from "../types";

// Types
export type { RetryConfig, RetryOptions, RetryResult, RetryStrategy } from "../types";

// Retry strategies
const calculateDelay = (
	strategy: RetryOptions["strategy"],
	attempt: number,
	baseDelay: number,
	maxDelay: number,
): number => {
	switch (strategy) {
		case "fixed":
			return baseDelay;
		case "linear":
			return Math.min(baseDelay * (attempt + 1), maxDelay);
		case "exponential":
		default:
			return Math.min(baseDelay * 2 ** attempt, maxDelay);
	}
};

// Effect-based retry
export const retryEffect = <T>(
	effect: Effect.Effect<T, Error>,
	config: RetryConfig,
): Effect.Effect<T, Error> =>
	Effect.retry(
		effect,
		(Effect as any).Schedule.exponential(`${config.retryDelay ?? 1000} millis`).pipe(
			(Effect as any).Schedule.recurs(config.maxRetries ?? 3),
		),
	).pipe(
		Effect.catchAll((error) => Effect.fail(error)),
		Effect.tapError((error: unknown) =>
			Effect.log(`Retry failed: ${error instanceof Error ? error.message : String(error)}`)
		),
	) as Effect.Effect<T, Error, never>;

// Pure retry function
export const retry = async <T>(
	fn: () => Promise<T>,
	options: RetryOptions = {},
): Promise<RetryResult<T>> => {
	const {
		strategy = "exponential",
		baseDelay = 1000,
		maxDelay = 30000,
		maxAttempts = 3,
		shouldRetry,
		onRetry,
	} = options;

	const startTime = Date.now();
	let lastError: Error | undefined;

	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		try {
			const value = await fn();
			return {
				attempts: attempt + 1,
				success: true,
				totalDuration: Date.now() - startTime,
				value,
			};
		} catch (err) {
			lastError = err instanceof Error ? err : new Error(String(err));

			if (shouldRetry && !shouldRetry(lastError)) {
				break;
			}

			if (attempt < maxAttempts - 1) {
				const delay = calculateDelay(strategy, attempt, baseDelay, maxDelay);

				if (onRetry) {
					onRetry(attempt + 1, lastError, delay);
				}

				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}
	}

	return {
		attempts: maxAttempts,
		error: lastError!,
		success: false,
		totalDuration: Date.now() - startTime,
	};
};

// Retry policy factory
export const createRetryPolicy = (
	config: Partial<RetryConfig>,
): RetryConfig => ({
	enabled: config.enabled ?? true,
	exponentialBackoff: config.exponentialBackoff ?? true,
	maxDelay: config.maxDelay ?? 30000,
	maxRetries: config.maxRetries ?? 3,
	onRetry: config.onRetry as any,
	retryableErrors: config.retryableErrors ?? [],
	retryDelay: config.retryDelay ?? 1000,
});

// Default retry configuration
export const defaultRetryConfig: RetryConfig = {
	enabled: true,
	maxRetries: 3,
	retryDelay: 1000,
	exponentialBackoff: true,
	maxDelay: 30000,
	retryableErrors: [],
};
