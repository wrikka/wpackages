/**
 * Circuit breaker service implementation
 */

import { Effect } from "effect";
import type {
	CircuitBreaker,
	CircuitBreakerConfig,
	CircuitBreakerState,
	CircuitBreakerStats,
	CircuitState,
} from "../types";

const createInitialState = (): CircuitBreakerState => ({
	failureCount: 0,
	lastFailureTime: 0,
	nextAttemptTime: 0,
	state: "CLOSED",
	successCount: 0,
});

const createInitialStats = (): CircuitBreakerStats => ({
	failureCalls: 0,
	failureRate: 0,
	rejectedCalls: 0,
	state: "CLOSED",
	successCalls: 0,
	totalCalls: 0,
});

const shouldAttemptReset = (
	state: CircuitBreakerState,
	_timeout: number,
	now: number,
): boolean => state.state === "OPEN" && now >= state.nextAttemptTime;

const shouldTripToOpen = (
	state: CircuitBreakerState,
	config: CircuitBreakerConfig,
): boolean => state.state === "CLOSED" && state.failureCount >= config.failureThreshold;

const shouldResetToClosed = (
	state: CircuitBreakerState,
	config: CircuitBreakerConfig,
): boolean => state.state === "HALF_OPEN" && state.successCount >= config.successThreshold;

const shouldTripToOpenFromHalfOpen = (state: CircuitBreakerState): boolean =>
	state.state === "HALF_OPEN" && state.failureCount > 0;

const transitionToState = (
	currentState: CircuitBreakerState,
	newState: CircuitState,
	config: CircuitBreakerConfig,
	now: number,
): CircuitBreakerState => {
	if (currentState.state === newState) return currentState;

	config.onStateChange?.(currentState.state, newState);

	switch (newState) {
		case "OPEN":
			return {
				...currentState,
				nextAttemptTime: now + config.timeout,
				state: "OPEN",
			};
		case "HALF_OPEN":
			return {
				...currentState,
				failureCount: 0,
				state: "HALF_OPEN",
				successCount: 0,
			};
		case "CLOSED":
			return {
				...currentState,
				failureCount: 0,
				state: "CLOSED",
				successCount: 0,
			};
	}
};

const recordSuccess = (state: CircuitBreakerState): CircuitBreakerState => ({
	...state,
	failureCount: 0,
	successCount: state.successCount + 1,
});

const recordFailure = (
	state: CircuitBreakerState,
	now: number,
): CircuitBreakerState => ({
	...state,
	failureCount: state.failureCount + 1,
	lastFailureTime: now,
});

const calculateFailureRate = (stats: CircuitBreakerStats): number => {
	const { totalCalls, failureCalls } = stats;
	return totalCalls > 0 ? failureCalls / totalCalls : 0;
};

export const createCircuitBreaker = <T = unknown>(
	config: CircuitBreakerConfig,
): CircuitBreaker<T> => {
	let state: CircuitBreakerState = createInitialState();
	let stats: CircuitBreakerStats = createInitialStats();

	const updateStats = (success: boolean, rejected = false): void => {
		stats = {
			...stats,
			failureCalls: !success && !rejected ? stats.failureCalls + 1 : stats.failureCalls,
			rejectedCalls: rejected ? stats.rejectedCalls + 1 : stats.rejectedCalls,
			state: state.state,
			successCalls: success ? stats.successCalls + 1 : stats.successCalls,
			totalCalls: rejected ? stats.totalCalls : stats.totalCalls + 1,
		};
		stats = {
			...stats,
			failureRate: calculateFailureRate(stats),
		};
	};

	const checkAndUpdateState = (): void => {
		const now = Date.now();

		if (shouldAttemptReset(state, config.timeout, now)) {
			state = transitionToState(state, "HALF_OPEN", config, now);
		}
	};

	const execute = async <R = T>(fn: () => Promise<R>): Promise<R> => {
		checkAndUpdateState();

		if (state.state === "OPEN") {
			updateStats(false, true);
			throw new Error("Circuit breaker is OPEN");
		}

		try {
			const result = await fn();
			const now = Date.now();

			state = recordSuccess(state);
			updateStats(true);
			config.onSuccess?.();

			if (shouldResetToClosed(state, config)) {
				state = transitionToState(state, "CLOSED", config, now);
			}

			return result;
		} catch (err) {
			const error = err as Error;
			const now = Date.now();

			const shouldTrip = config.shouldTrip ? config.shouldTrip(error) : true;

			if (shouldTrip) {
				state = recordFailure(state, now);
				updateStats(false);
				config.onFailure?.(error);

				if (shouldTripToOpen(state, config)) {
					state = transitionToState(state, "OPEN", config, now);
				} else if (shouldTripToOpenFromHalfOpen(state)) {
					state = transitionToState(state, "OPEN", config, now);
				}
			} else {
				updateStats(true);
			}

			throw error;
		}
	};

	return {
		execute,
		forceClosed: () => {
			const now = Date.now();
			state = transitionToState(state, "CLOSED", config, now);
		},
		forceOpen: () => {
			const now = Date.now();
			state = transitionToState(state, "OPEN", config, now);
		},
		getState: () => ({ ...state }),
		getStats: () => ({ ...stats }),
		reset: () => {
			state = createInitialState();
			stats = createInitialStats();
		},
	};
};

// Effect-based circuit breaker
export const circuitBreakerEffect = <T>(
	circuitBreaker: CircuitBreaker<T>,
	effect: Effect.Effect<T, Error>,
): Effect.Effect<T, Error> =>
	Effect.tryPromise({
		try: () => circuitBreaker.execute(() => Effect.runPromise(effect)),
		catch: (error) => new Error(`Circuit breaker execution failed: ${error}`),
	});

// Circuit breaker config factory
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

// Default circuit breaker configuration
export const defaultCircuitBreakerConfig: CircuitBreakerConfig = {
	failureThreshold: 5,
	successThreshold: 2,
	timeout: 60000,
};
