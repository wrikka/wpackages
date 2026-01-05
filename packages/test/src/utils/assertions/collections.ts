/**
 * Collection assertions
 */

import { AssertionError, throwIfFails } from "../../error";
import type { AssertionOptions } from "../../types";

export function toContain<T>(actual: T, item: unknown, options?: AssertionOptions): void {
	if (!Array.isArray(actual)) {
		throw new AssertionError(options?.message || "Expected value to be an array");
	}
	const pass = actual.includes(item as any);
	throwIfFails(pass, options?.message || "Expected array to contain item", item, actual);
}

export function toContainString(actual: unknown, substring: string, options?: AssertionOptions): void {
	if (typeof actual !== "string") {
		throw new AssertionError(options?.message || "Expected value to be a string");
	}
	const pass = actual.includes(substring);
	throwIfFails(pass, options?.message || "Expected string to contain substring", substring, actual);
}
