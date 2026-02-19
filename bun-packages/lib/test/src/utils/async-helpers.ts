/**
 * Async testing helpers
 */

/**
 * Wait for condition to be true
 */
export const waitFor = async (
	condition: () => boolean,
	timeout = 1000,
	interval = 50,
): Promise<void> => {
	const startTime = Date.now();

	while (!condition()) {
		if (Date.now() - startTime > timeout) {
			throw new Error(`Timeout waiting for condition after ${timeout}ms`);
		}
		await new Promise((resolve) => setTimeout(resolve, interval));
	}
};

/**
 * Delay execution
 */
export const delay = (ms: number): Promise<void> => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Retry async function
 */
export const retry = async <T>(
	fn: () => Promise<T>,
	maxAttempts = 3,
	delayMs = 100,
): Promise<T> => {
	let lastError: Error | undefined;

	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));
			if (attempt < maxAttempts - 1) {
				await delay(delayMs);
			}
		}
	}

	throw lastError || new Error("Retry failed");
};

/**
 * Race multiple promises
 */
export const race = <T>(
	promises: Promise<T>[],
	timeout = 5000,
): Promise<T> => {
	return Promise.race([
		Promise.race(promises),
		new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Race timeout after ${timeout}ms`)), timeout)),
	]);
};

/**
 * Timeout wrapper
 */
export const withTimeout = <T>(
	promise: Promise<T>,
	timeout = 5000,
): Promise<T> => {
	return Promise.race([
		promise,
		new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Timeout after ${timeout}ms`)), timeout)),
	]);
};

/**
 * Batch async operations
 */
export const batch = async <T>(
	items: T[],
	fn: (item: T) => Promise<void>,
	batchSize = 5,
): Promise<void> => {
	for (let i = 0; i < items.length; i += batchSize) {
		const batch = items.slice(i, i + batchSize);
		await Promise.all(batch.map(fn));
	}
};

/**
 * Sequential async operations
 */
export const sequential = async <T, R>(
	items: T[],
	fn: (item: T) => Promise<R>,
): Promise<R[]> => {
	const results: R[] = [];
	for (const item of items) {
		results.push(await fn(item));
	}
	return results;
};
