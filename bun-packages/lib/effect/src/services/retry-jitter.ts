import type { Effect } from "../types";
import type { JitterStrategy, RetryWithJitterConfig } from "../types/retry-jitter";

export const fullJitter: JitterStrategy = {
	_tag: "JitterStrategy",
	calculate: (_attempt, baseDelay) => {
		return Math.random() * baseDelay;
	},
};

export const equalJitter: JitterStrategy = {
	_tag: "JitterStrategy",
	calculate: (_attempt, baseDelay) => {
		return baseDelay / 2 + (Math.random() * baseDelay) / 2;
	},
};

export const decorrelatedJitter: JitterStrategy = {
	_tag: "JitterStrategy",
	calculate: (_attempt, baseDelay) => {
		return baseDelay * (0.5 + Math.random());
	},
};

export const noJitter: JitterStrategy = {
	_tag: "JitterStrategy",
	calculate: (_attempt, baseDelay) => baseDelay,
};

export const retryWithJitter = <A, E>(
	effect: Effect<A, E>,
	config: RetryWithJitterConfig,
): Effect<A, E> => {
	return async () => {
		let lastError: E | undefined;

		for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
			try {
				return await effect();
			} catch (error) {
				lastError = error as E;

				if (attempt === config.maxRetries) {
					throw lastError;
				}

				const delay = Math.min(
					config.jitter.calculate(attempt, config.baseDelay),
					config.maxDelay,
				);

				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}

		throw lastError!;
	};
};
