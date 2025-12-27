/**
 * Timeout service implementation
 */

import { Effect } from "effect";
import { TimeoutError } from "../errors";
import type { TimeoutConfig, TimeoutOptions, TimeoutResult } from "../types";

// Timeout wrapper
export const withTimeout = <T>(
	fn: () => Promise<T>,
	config: TimeoutConfig,
): Promise<T> => {
	return new Promise<T>((resolve, reject) => {
		let completed = false;
		let timeoutId: NodeJS.Timeout | undefined;

		const cleanup = () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
				timeoutId = undefined;
			}
		};

		const handleSuccess = (value: T) => {
			if (!completed) {
				completed = true;
				cleanup();
				resolve(value);
			}
		};

		const handleError = (error: unknown) => {
			if (!completed) {
				completed = true;
				cleanup();
				reject(error);
			}
		};

		const handleTimeout = () => {
			if (!completed) {
				completed = true;
				config.onTimeout?.();
				reject(
					new TimeoutError(`Operation timed out after ${config.duration}ms`),
				);
			}
		};

		if (config.signal?.aborted) {
			handleTimeout();
			return;
		}

		config.signal?.addEventListener("abort", handleTimeout, { once: true });

		timeoutId = setTimeout(handleTimeout, config.duration);

		fn().then(handleSuccess).catch(handleError);
	});
};

// Timeout with result tracking
export const timeout = async <T>(
	fn: () => Promise<T>,
	options: TimeoutOptions,
): Promise<TimeoutResult<T>> => {
	const startTime = Date.now();

	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => {
			controller.abort();
			options.onTimeout?.();
		}, options.duration);

		const result = await Promise.race([
			fn(),
			new Promise<never>((_, reject) => {
				controller.signal.addEventListener("abort", () => {
					reject(
						new TimeoutError(`Operation timed out after ${options.duration}ms`),
					);
				});
			}),
		]);

		clearTimeout(timeoutId);

		return {
			duration: Date.now() - startTime,
			success: true,
			value: result,
		};
	} catch (err) {
		const duration = Date.now() - startTime;

		if (err instanceof TimeoutError) {
			if (options.cleanup) {
				try {
					await options.cleanup();
				} catch (cleanupError) {
					console.error("Cleanup failed", { error: cleanupError });
				}
			}

			return {
				duration,
				error: err,
				success: false,
			};
		}

		throw err;
	}
};

// Race with timeout
export const race = <T>(
	promises: readonly Promise<T>[],
	duration: number,
): Promise<T> => {
	return withTimeout(() => Promise.race(promises), { duration });
};

// Race all with timeout
export const raceAll = async <T>(
	promises: readonly Promise<T>[],
	duration: number,
): Promise<T[]> => {
	const results = await Promise.allSettled(
		promises.map((p) => withTimeout(() => p, { duration })),
	);

	const successful = results
		.filter((r): r is PromiseFulfilledResult<Awaited<T>> => r.status === "fulfilled")
		.map((r: any) => r.value);

	if (successful.length === 0) {
		throw new TimeoutError("All operations timed out");
	}

	return successful;
};

// Deadline wrapper
export const withDeadline = <T>(
	fn: () => Promise<T>,
	deadline: Date,
): Promise<T> => {
	const now = Date.now();
	const deadlineMs = deadline.getTime();
	const duration = deadlineMs - now;

	if (duration <= 0) {
		return Promise.reject(new TimeoutError("Deadline already passed"));
	}

	return withTimeout(fn, { duration });
};

// Delay utility
export const delay = (ms: number): Promise<void> => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};

// Effect-based timeout
export const timeoutEffect = <T>(
	effect: Effect.Effect<T, Error>,
	duration: number,
): Effect.Effect<T, Error> =>
	Effect.timeout(effect, duration).pipe(
		Effect.catchAll(() => Effect.fail(new TimeoutError(`Operation timed out after ${duration}ms`))),
	);

// Timeout config factory
export const createTimeoutConfig = (
	partial: Partial<TimeoutConfig>,
): TimeoutConfig => ({
	duration: partial.duration ?? 30000,
	onTimeout: partial.onTimeout,
	signal: partial.signal,
});

// Default timeout configuration
export const defaultTimeoutConfig: TimeoutConfig = {
	duration: 30000,
};
