/**
 * Instance assertions
 */

import { throwIfFails } from "../../error";
import type { AssertionOptions } from "../../types";

export function toBeInstanceOf<T>(actual: T, expected: any, options?: AssertionOptions): void {
	const pass = actual instanceof expected;
	const expectedName = expected?.name || "unknown";
	const actualName = (actual as any)?.constructor?.name || typeof actual;
	throwIfFails(
		pass,
		options?.message || `Expected value to be an instance of ${expectedName}`,
		expectedName,
		actualName,
	);
}
