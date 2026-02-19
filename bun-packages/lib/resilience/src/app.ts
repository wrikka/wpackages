/**
 * Application composition and setup
 */

import { Cause, Effect, pipe } from "effect";
import { retryEffect, timeoutEffect } from "./services";
import type { ResilienceConfig, ResilienceResult } from "./types";
import { createFailure, createSuccess } from "./utils";

/**
 * Creates a resilient Effect by applying various resilience patterns based on the provided configuration.
 *
 * This is the primary composition function for the library.
 *
 * @param effect The base Effect to make resilient.
 * @param config The configuration for the resilience patterns.
 * @returns A new Effect with all the configured resilience patterns applied.
 */
export const createResilientEffect = <T>(
	effect: Effect.Effect<T, Error>,
	config: ResilienceConfig = {},
): Effect.Effect<T, Error> => {
	return pipe(
		effect,
		(e) => (config.timeout ? timeoutEffect(e, config.timeout) : e),
		(e) =>
			config.retryAttempts
				? retryEffect(e, { maxRetries: config.retryAttempts, enabled: true, exponentialBackoff: true })
				: e,
		// Note: Circuit Breaker and Bulkhead would be added here in a similar fashion
	);
};

/**
 * Runs a resilient operation and returns a `ResilienceResult`.
 *
 * This function takes a function that returns a Promise, converts it into an Effect,
 * applies the resilience patterns, and then executes it.
 *
 * @param operation A function that returns a Promise to be executed resiliently.
 * @param config The configuration for the resilience patterns.
 * @returns A Promise that resolves to a `ResilienceResult`.
 */
export const run = async <T>(
	operation: () => Promise<T>,
	config: ResilienceConfig = {},
): Promise<ResilienceResult<T>> => {
	const effect = Effect.tryPromise({
		try: operation,
		catch: (error) => (error instanceof Error ? error : new Error(String(error))),
	});

	const resilientEffect = createResilientEffect(effect, config);

	const result = await Effect.runPromiseExit(resilientEffect);

	if (result._tag === "Success") {
		return createSuccess(result.value);
	} else {
		const error = Cause.squash(result.cause);
		return createFailure(error instanceof Error ? error : new Error(String(error)));
	}
};
