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
		backoff?: "constant" | "linear" | "exponential";
	} = {},
): Promise<T> => {
	const { maxAttempts = 3, delay = 1000, backoff = "constant" } = _options;

	let lastError: Error | undefined;
	let currentDelay = delay;

	return new Promise((resolve, reject) => {
		const attempt = (count: number) => {
			fn().then((result) => {
				resolve(result);
			}).catch((error) => {
				lastError = error instanceof Error ? error : new Error(String(error));

				if (count < maxAttempts - 1) {
					setTimeout(() => {
						if (backoff === "exponential") {
							currentDelay *= 2;
						} else if (backoff === "linear") {
							currentDelay += delay;
						}
						attempt(count + 1);
					}, currentDelay);
				} else {
					reject(lastError);
				}
			});
		};
		attempt(0);
	});
};
