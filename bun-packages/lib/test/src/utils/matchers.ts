/**
 * Custom matchers for advanced assertions
 */

import type { CustomMatcher } from "../types";
import { isEqual } from "./diff";

function safeStringify(value: unknown): string {
	try {
		return JSON.stringify(value);
	} catch {
		return String(value);
	}
}

/**
 * Create custom matcher
 * @param _name - Name of the matcher (for documentation)
 * @param fn - Function to test if actual matches expected
 * @param message - Function to generate error message
 * @returns Custom matcher function
 */
export const createMatcher = <T>(
	_name: string,
	fn: (actual: T, expected: T) => boolean,
	message: (actual: T, expected: T) => string,
): CustomMatcher<T> => {
	return (actual: T, expected: T) => ({
		pass: fn(actual, expected),
		message: () => message(actual, expected),
	});
};

/**
 * Deep equality matcher
 * Compares values by JSON serialization
 */
export const deepEqualMatcher: CustomMatcher<unknown> = (actual, expected) => ({
	pass: isEqual(actual, expected),
	message: () => `Expected ${safeStringify(actual)} to deeply equal ${safeStringify(expected)}`,
});

/**
 * Type matcher
 * Compares the type of actual with expected type string
 */
export const typeMatcher: CustomMatcher<unknown> = (actual, expected) => ({
	pass: typeof actual === (expected as string),
	message: () => `Expected ${typeof actual} to be type ${String(expected)}`,
});

/**
 * Range matcher
 * Checks if actual is within 0.1 of expected value
 */
export const rangeMatcher: CustomMatcher<number> = (actual, expected) => {
	const range = 0.1;
	const pass = Math.abs(actual - expected) <= range;
	return {
		pass,
		message: () => `Expected ${actual} to be within ${range} of ${expected}`,
	};
};

/**
 * Array length matcher
 * Compares the length of two arrays
 */
export const arrayLengthMatcher: CustomMatcher<unknown[]> = (
	actual,
	expected,
) => ({
	pass: actual.length === (expected as unknown[]).length,
	message: () => `Expected array length ${actual.length} to equal ${(expected as unknown[]).length}`,
});

/**
 * String pattern matcher
 * @param pattern - RegExp pattern to match against
 * @returns Matcher function that tests if string matches pattern
 */
export const patternMatcher = (pattern: RegExp): CustomMatcher<string> => {
	return (actual: string) => ({
		pass: pattern.test(actual),
		message: () => `Expected "${actual}" to match pattern ${pattern}`,
	});
};
