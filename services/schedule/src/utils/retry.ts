import { Effect, Option } from "effect";
import type { RetryConfig } from "../types/job";

export const calculateBackoffDelay = (
	config: RetryConfig,
	attempt: number,
): number => {
	switch (config.backoffStrategy) {
		case "fixed":
			return config.initialDelay;
		case "linear":
			return Math.min(config.initialDelay * attempt, config.maxDelay);
		case "exponential":
			return Math.min(
				config.initialDelay * config.backoffMultiplier ** attempt,
				config.maxDelay,
			);
		default:
			return config.initialDelay;
	}
};

export const withRetry = <A, E>(
	effect: Effect.Effect<A, E>,
	config: RetryConfig,
): Effect.Effect<A, E> => {
	return Effect.gen(function* () {
		let lastError: E | undefined;

		for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
			const result = yield* Effect.either(effect);

			if (Effect.isEitherSuccess(result)) {
				return result.right;
			}

			lastError = result.left;

			if (attempt < config.maxRetries) {
				const delay = calculateBackoffDelay(config, attempt);
				yield* Effect.sleep(delay);
			}
		}

		return yield* Option.match(Option.fromNullable(lastError), {
			onNone: () => Effect.fail(new Error("Retry failed without error")),
			onSome: (err: E) => Effect.fail(err),
		});
	});
};

export const shouldRetry = (config: RetryConfig): boolean => {
	if (config.maxRetries <= 0) {
		return false;
	}
	return true;
};
