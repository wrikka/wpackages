/**
 * Type assertions
 */

import type { AssertionOptions } from "../../types";
import { throwIfFails } from "../error";

export function toBeType<T>(actual: T, type: string, options?: AssertionOptions): void {
	const pass = typeof actual === type;
	throwIfFails(pass, options?.message || `Expected value to be of type ${type}`, type, typeof actual);
}
