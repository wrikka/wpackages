/**
 * Fallback utility for resilience patterns.
 */

import type { ResilienceFunction } from "../types";
import { createFailure, createSuccess } from "./result";

/**
 * Fallback component - pure function composition
 */
export const withFallback = <T, A extends readonly unknown[] = []>(
	fn: ResilienceFunction<T, A>,
	fallbackFn: () => Promise<T>,
): ResilienceFunction<T, A> =>
async (...args: A) => {
	try {
		const result = await fn(...args);
		if (result.success) {
			return result;
		}
	} catch {
		// Continue to fallback
	}

	try {
		const fallbackValue = await fallbackFn();
		return createSuccess(fallbackValue);
	} catch (fallbackError) {
		return createFailure(
			fallbackError instanceof Error ? fallbackError : new Error(String(fallbackError)),
		);
	}
};
