/**
 * Equality assertions
 */

import { throwIfFails } from "../../error";
import type { AssertionOptions } from "../../types";
import { isEqual } from "../diff";

export function toEqual<T>(actual: T, expected: T, options?: AssertionOptions): void {
	const pass = isEqual(actual, expected);
	throwIfFails(pass, options?.message || "Expected values to be equal", expected, actual);
}

export function toBe<T>(actual: T, expected: T, options?: AssertionOptions): void {
	const pass = Object.is(actual, expected);
	throwIfFails(pass, options?.message || "Expected values to be strictly equal", expected, actual);
}
