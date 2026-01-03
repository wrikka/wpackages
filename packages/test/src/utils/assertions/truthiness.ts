/**
 * Truthiness assertions
 */

import type { AssertionOptions } from "../../types";
import { throwIfFails } from "../error";

export function toBeTruthy<T>(actual: T, options?: AssertionOptions): void {
	const pass = !!actual;
	throwIfFails(pass, options?.message || "Expected value to be truthy", true, actual);
}

export function toBeFalsy<T>(actual: T, options?: AssertionOptions): void {
	const pass = !actual;
	throwIfFails(pass, options?.message || "Expected value to be falsy", false, actual);
}

export function toBeNull<T>(actual: T, options?: AssertionOptions): void {
	const pass = actual === null;
	throwIfFails(pass, options?.message || "Expected value to be null", null, actual);
}

export function toBeUndefined<T>(actual: T, options?: AssertionOptions): void {
	const pass = actual === undefined;
	throwIfFails(pass, options?.message || "Expected value to be undefined", undefined, actual);
}
