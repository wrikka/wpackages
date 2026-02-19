/**
 * Circuit breaker service implementation using Effect-TS and Ref for state management.
 */

import { Clock, Effect, Ref } from "effect";
import { CircuitBreakerOpenError } from "../errors";
import type { CircuitBreakerConfig, CircuitBreakerState, CircuitState } from "../types";

const createInitialState = (): CircuitBreakerState => ({
	state: "CLOSED",
	failureCount: 0,
	successCount: 0,
	lastFailureTime: 0,
	nextAttemptTime: 0,
});

const transitionTo = (state: CircuitState, now: number, config: CircuitBreakerConfig): CircuitBreakerState => {
	switch (state) {
		case "OPEN":
			return { ...createInitialState(), state: "OPEN", nextAttemptTime: now + config.timeout };
		case "HALF_OPEN":
			return { ...createInitialState(), state: "HALF_OPEN" };
		case "CLOSED":
			return createInitialState();
	}
};

/**
 * Creates a circuit breaker as a higher-order function (wrapper) that can be applied to an Effect.
 *
 * @param config The configuration for the circuit breaker.
 * @returns An Effect that resolves to a wrapper function. This wrapper function takes an Effect
 *          and returns a new Effect with the circuit breaker logic applied.
 */
export const createCircuitBreaker = <T, E>(
	config: CircuitBreakerConfig,
): Effect.Effect<(effect: Effect.Effect<T, E>) => Effect.Effect<T, E | CircuitBreakerOpenError>, never> =>
	Ref.make(createInitialState()).pipe(
		Effect.map((stateRef) => (effect: Effect.Effect<T, E>) =>
			Effect.gen(function*(_) {
				const now = yield* _(Clock.currentTimeMillis);
				const state = yield* _(Ref.get(stateRef));

				if (state.state === "OPEN") {
					if (now >= state.nextAttemptTime) {
						yield* _(Ref.set(stateRef, transitionTo("HALF_OPEN", now, config)));
					} else {
						return yield* _(Effect.fail(new CircuitBreakerOpenError("Circuit breaker is open")));
					}
				}

				return yield* _(
					effect.pipe(
						Effect.tap(() =>
							Ref.update(stateRef, (s) => {
								if (s.state === "HALF_OPEN") {
									const newSuccessCount = s.successCount + 1;
									if (newSuccessCount >= config.successThreshold) {
										return transitionTo("CLOSED", 0, config); // Transition to CLOSED
									}
									return { ...s, successCount: newSuccessCount };
								}
								return s; // No change in CLOSED state
							})
						),
						Effect.catchAll((error) =>
							Clock.currentTimeMillis.pipe(
								Effect.flatMap((now) =>
									Ref.updateAndGet(stateRef, (s) => {
										if (s.state === "HALF_OPEN") {
											return transitionTo("OPEN", now, config);
										}

										const newFailureCount = s.failureCount + 1;
										if (newFailureCount >= config.failureThreshold) {
											return transitionTo("OPEN", now, config);
										}
										return { ...s, failureCount: newFailureCount, lastFailureTime: now };
									})
								),
								Effect.flatMap(() => Effect.fail(error)),
							)
						),
					),
				);
			})
		),
	);

/**
 * A higher-order function that applies a circuit breaker to an Effect.
 * This is a convenience wrapper around `createCircuitBreaker`.
 *
 * @param config The configuration for the circuit breaker.
 * @returns A function that takes an Effect and returns a new Effect with the circuit breaker logic.
 */
export const circuitBreakerEffect = <T, E>(
	config: CircuitBreakerConfig,
): (effect: Effect.Effect<T, E>) => Effect.Effect<T, E | CircuitBreakerOpenError> =>
(effect: Effect.Effect<T, E>) => Effect.flatMap(createCircuitBreaker<T, E>(config), (cb) => cb(effect));

/**
 * Factory for creating a `CircuitBreakerConfig`.
 */
export const createCircuitBreakerConfig = (
	partial: Partial<CircuitBreakerConfig>,
): CircuitBreakerConfig => ({
	failureThreshold: partial.failureThreshold ?? 5,
	successThreshold: partial.successThreshold ?? 2,
	timeout: partial.timeout ?? 60000,
	...(partial.resetTimeout !== undefined && {
		resetTimeout: partial.resetTimeout,
	}),
	...(partial.onStateChange && { onStateChange: partial.onStateChange }),
	...(partial.onSuccess && { onSuccess: partial.onSuccess }),
	...(partial.onFailure && { onFailure: partial.onFailure }),
	...(partial.shouldTrip && { shouldTrip: partial.shouldTrip }),
});

/**
 * Default circuit breaker configuration.
 */
export const defaultCircuitBreakerConfig: CircuitBreakerConfig = {
	failureThreshold: 5,
	successThreshold: 2,
	timeout: 60000,
};
