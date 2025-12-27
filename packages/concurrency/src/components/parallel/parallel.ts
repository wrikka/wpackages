import type { ParallelOptions, ParallelResult } from "./types";

/**
 * Run multiple async functions in parallel with concurrency control
 *
 * @param fns - Array of async functions to execute
 * @param options - Parallel execution options
 * @returns Array of results with success/failure information
 */
export const parallel = async <T>(
	fns: Array<() => Promise<T>>,
	_options: ParallelOptions = {},
): Promise<ParallelResult<T>[]> => {
	const { concurrency = Infinity, failFast = false } = _options;

	if (concurrency <= 0) {
		throw new Error("Concurrency must be greater than 0");
	}

	const results: ParallelResult<T>[] = Array.from({ length: fns.length }, () => undefined as any);
	const executing: Array<Promise<void>> = [];

	for (let i = 0; i < fns.length; i++) {
		const fn = fns[i]!;

		const promise = (async () => {
			try {
				const value = await fn();
				results[i] = { success: true, value };
			} catch (_error) {
				const error = _error instanceof Error ? _error : new Error(String(_error));
				const result: ParallelResult<T> = {
					success: false,
					error,
				};
				results[i] = result;

				if (failFast) {
					throw error;
				}
			}
		})();

		executing.push(promise);

		// If we've reached the concurrency limit, wait for one to complete
		if (executing.length >= concurrency) {
			// Wait for the first promise to complete
			await Promise.race(executing);
		}
	}

	// Wait for all remaining promises to complete
	await Promise.all(executing);

	return results;
};

/**
 * Run multiple async functions in parallel with concurrency control and collect results
 *
 * @param fns - Array of async functions to execute
 * @param options - Parallel execution options
 * @returns Object containing successful results and errors
 */
export const parallelCollect = async <T>(
	fns: Array<() => Promise<T>>,
	_options: ParallelOptions = {},
): Promise<{
	success: T[];
	errors: Error[];
}> => {
	const results = await parallel(fns, _options);

	const success: T[] = [];
	const errors: Error[] = [];

	for (const result of results) {
		if (result.success && result.value !== undefined) {
			success.push(result.value);
		} else if (result.error) {
			errors.push(result.error);
		}
	}

	return { success, errors };
};

/**
 * Run multiple async functions in parallel and return the first successful result
 *
 * @param fns - Array of async functions to execute
 * @returns First successful result or throws if all fail
 */
export const firstSuccess = async <T>(
	fns: Array<() => Promise<T>>,
): Promise<T> => {
	if (fns.length === 0) {
		throw new Error("No functions provided");
	}

	// Race all promises
	const results = await Promise.allSettled(fns.map(fn => fn()));

	// Find first successful result
	for (const result of results) {
		if (result.status === "fulfilled") {
			return result.value;
		}
	}

	// If all failed, throw the first error
	const firstResult = results[0];
	if (firstResult && firstResult.status === "rejected") {
		throw firstResult.reason;
	}

	throw new Error("All functions failed");
};
