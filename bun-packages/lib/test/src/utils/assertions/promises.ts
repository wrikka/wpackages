/**
 * Promise assertions
 */

import { AssertionError } from "../../error";
import type { AssertionOptions } from "../../types";

export async function toResolve(actual: unknown, options?: AssertionOptions): Promise<void> {
	if (!(actual instanceof Promise)) {
		throw new AssertionError(options?.message || "Expected value to be a Promise");
	}
	try {
		await actual;
	} catch (error) {
		throw new AssertionError(options?.message || "Expected promise to resolve", undefined, error);
	}
}

export async function toReject(actual: unknown, options?: AssertionOptions): Promise<void> {
	if (!(actual instanceof Promise)) {
		throw new AssertionError(options?.message || "Expected value to be a Promise");
	}
	try {
		await actual;
		throw new AssertionError(options?.message || "Expected promise to reject");
	} catch {
		// Any rejection satisfies this assertion.
	}
}
