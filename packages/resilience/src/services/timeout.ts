/**
 * Timeout service implementation based on Effect-TS
 */

import { Duration, Effect } from "effect";
import { TimeoutError } from "../errors";
import type { TimeoutConfig } from "../types";

// Types
export type { TimeoutConfig } from "../types";

/**
 * An Effect-based timeout mechanism.
 *
 * If the effect does not complete within the specified duration, it will fail with a `TimeoutError`.
 *
 * @param effect The Effect to apply the timeout to.
 * @param duration The timeout duration in milliseconds.
 * @returns An Effect that will time out if it doesn't complete within the duration.
 */
export const timeoutEffect = <T, E>(
	effect: Effect.Effect<T, E>,
	duration: number,
): Effect.Effect<T, E | TimeoutError> =>
	Effect.timeoutFail(effect, {
		duration: Duration.millis(duration),
		onTimeout: () => new TimeoutError(`Operation timed out after ${duration}ms`),
	});

/**
 * Factory function to create a `TimeoutConfig` object with default values.
 *
 * @param config A partial `TimeoutConfig` object.
 * @returns A complete `TimeoutConfig` object with defaults applied.
 */
export const createTimeoutConfig = (
	partial: Partial<TimeoutConfig>,
): TimeoutConfig => ({
	duration: partial.duration ?? 30000,
	onTimeout: partial.onTimeout,
	signal: partial.signal,
});

/**
 * Default timeout configuration.
 */
export const defaultTimeoutConfig: TimeoutConfig = {
	duration: 30000,
};
