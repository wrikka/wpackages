/**
 * Retry service implementation based on Effect-TS
 */

import { Duration, Effect, Schedule } from "effect";
import type { RetryConfig } from "../types";

// Types
export type { RetryConfig } from "../types";

/**
 * An Effect-based retry mechanism that uses a configurable schedule.
 *
 * @param effect The Effect to retry.
 * @param config The configuration for the retry behavior.
 * @returns An Effect that will be retried according to the specified configuration.
 */
export const retryEffect = <T>(
	effect: Effect.Effect<T, Error>,
	config: RetryConfig,
): Effect.Effect<T, Error> => {
	if (!config.enabled) {
		return effect;
	}

	const baseDelay = Duration.millis(config.retryDelay ?? 1000);

	const schedule = config.exponentialBackoff
		? Schedule.exponential(baseDelay)
		: Schedule.spaced(baseDelay);

	const recurs = Schedule.recurs(config.maxRetries ?? 3);
	const composedSchedule = Schedule.compose(schedule, recurs);

	return Effect.retry(effect, composedSchedule).pipe(
		Effect.catchAll((error) => {
			// This block is for logging and then re-throwing the original error.
			return Effect.log(
				`Retry schedule exhausted. Last error: ${error instanceof Error ? error.message : String(error)}`,
			).pipe(Effect.flatMap(() => Effect.fail(error)));
		}),
	);
};

/**
 * Factory function to create a `RetryConfig` object with default values.
 *
 * @param config A partial `RetryConfig` object.
 * @returns A complete `RetryConfig` object with defaults applied.
 */
export const createRetryPolicy = (
	config: Partial<RetryConfig>,
): RetryConfig => ({
	enabled: config.enabled ?? true,
	exponentialBackoff: config.exponentialBackoff ?? true,
	maxDelay: config.maxDelay ?? 30000,
	maxRetries: config.maxRetries ?? 3,
	onRetry: config.onRetry as any, // Note: onRetry is not yet implemented in retryEffect
	retryableErrors: config.retryableErrors ?? [], // Note: retryableErrors is not yet implemented
	retryDelay: config.retryDelay ?? 1000,
});

/**
 * Default retry configuration.
 */
export const defaultRetryConfig: RetryConfig = {
	enabled: true,
	maxRetries: 3,
	retryDelay: 1000,
	exponentialBackoff: true,
	maxDelay: 30000,
	retryableErrors: [],
};
