export type BackoffStrategy = "constant" | "linear" | "exponential";

/**
 * retry - Retry function on failure
 *
 * @param fn - Function to retry
 * @param options - Retry options
 * @returns Promise with result
 */
export const retry = <T>(
	fn: () => Promise<T>,
	_options: {
		maxAttempts?: number;
		delay?: number;
		backoff?: BackoffStrategy;
	} = {},
): Promise<T> => {
	const { maxAttempts = 3, delay = 1000, backoff = "constant" } = _options;

	const transformDelay = (currentDelay: number): number => {
		switch (backoff) {
			case "exponential":
				return currentDelay * 2;
			case "linear":
				return currentDelay + delay;
			case "constant":
			default:
				return currentDelay;
		}
	};

	let lastError: Error | undefined;

	return new Promise((resolve, reject) => {
		const attempt = (count: number, currentDelay: number) => {
			fn()
				.then(resolve)
				.catch((error) => {
					lastError = error instanceof Error ? error : new Error(String(error));

					if (count < maxAttempts - 1) {
						const nextDelay = transformDelay(currentDelay);
						setTimeout(() => attempt(count + 1, nextDelay), currentDelay);
					} else {
						reject(lastError);
					}
				});
		};

		attempt(0, delay);
	});
};
