import type { RetryOptions } from "../types";
import { sleep } from "./sleep";

const calculateDelay = (
	attempt: number,
	options: Required<Pick<RetryOptions, "delay" | "backoff" | "backoffFactor" | "maxDelay" | "jitter">>,
): number => {
	const { delay, backoff, backoffFactor, maxDelay, jitter } = options;

	let calculatedDelay: number;

	switch (backoff) {
		case "exponential":
			calculatedDelay = delay * backoffFactor ** (attempt - 1);
			break;
		case "linear":
			calculatedDelay = delay + delay * backoffFactor * (attempt - 1);
			break;
		case "constant":
		default:
			calculatedDelay = delay;
	}

	if (jitter) {
		calculatedDelay = calculatedDelay * (0.5 + Math.random() * 0.5);
	}

	return Math.min(calculatedDelay, maxDelay);
};

export const retry = async <A>(
	fn: () => Promise<A>,
	options: RetryOptions = {},
): Promise<A> => {
	const {
		maxAttempts = 3,
		delay = 1000,
		backoff = "exponential",
		backoffFactor = 2,
		maxDelay = Number.POSITIVE_INFINITY,
		jitter = true,
		signal,
		onRetry,
	} = options;

	let lastError: unknown;

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		if (signal?.aborted) {
			throw signal.reason ?? new Error("retry: aborted");
		}

		try {
			return await fn();
		} catch (error) {
			lastError = error;

			if (attempt < maxAttempts) {
				const delayMs = calculateDelay(attempt, {
					delay,
					backoff,
					backoffFactor,
					maxDelay,
					jitter,
				});

				onRetry?.(attempt, error);
				await sleep(delayMs, { signal });
			}
		}
	}

	throw lastError;
};
