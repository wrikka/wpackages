/**
 * Application composition and setup
 */

import type { ResilienceConfig, ResilienceFunction, ResilienceResult } from "./types";
import { createFailure, createSuccess } from "./utils";

/**
 * Create a resilient function with all patterns
 *
 * Note: This is a simplified composition layer. For more advanced patterns,
 * use individual services from the services module directly.
 */
export const createResilientFunction = <T, A extends readonly unknown[] = []>(
	fn: (...args: A) => Promise<T>,
	_config: ResilienceConfig = {},
): ResilienceFunction<T, A> => {
	return async (...args: A) => {
		try {
			const data = await fn(...args);
			return createSuccess(data);
		} catch (err) {
			return createFailure(err instanceof Error ? err : new Error(String(err)));
		}
	};
};

/**
 * Execute a function with resilience patterns
 */
export const execute = async <T, A extends readonly unknown[] = []>(
	fn: (...args: A) => Promise<T>,
	args: A,
	config?: ResilienceConfig,
): Promise<ResilienceResult<T>> => {
	const resilientFn = createResilientFunction(fn, config);
	return resilientFn(...args);
};

/**
 * Run the resilience application
 */
export const run = async <T>(
	operation: () => Promise<T>,
	config?: ResilienceConfig,
): Promise<ResilienceResult<T>> => {
	return execute(operation, [], config);
};
