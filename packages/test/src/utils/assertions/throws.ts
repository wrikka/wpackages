/**
 * Error throwing assertions
 */

import type { AssertionOptions } from "../../types";
import { AssertionError } from "../error";

export function toThrow(actual: unknown, options?: AssertionOptions): void {
	if (typeof actual !== "function") {
		throw new AssertionError(options?.message || "Expected value to be a function");
	}
	try {
		(actual as Function)();
		throw new AssertionError(options?.message || "Expected function to throw");
	} catch (error) {
		if (error instanceof AssertionError) {
			throw error;
		}
	}
}

export async function toThrowAsync(actual: unknown, options?: AssertionOptions): Promise<void> {
	if (typeof actual !== "function") {
		throw new AssertionError(options?.message || "Expected value to be a function");
	}
	try {
		await (actual as Function)();
		throw new AssertionError(options?.message || "Expected function to throw");
	} catch (error) {
		if (error instanceof AssertionError) {
			throw error;
		}
	}
}
