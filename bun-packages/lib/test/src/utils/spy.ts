/**
 * Spy utilities for testing
 */

import { createMock, type MockFn } from "./mock";

/**
 * Spy on object method
 */
export const spyOn = <T extends Record<string, unknown>, K extends keyof T>(
	obj: T,
	method: K,
): MockFn<T[K] extends (...args: unknown[]) => unknown ? T[K] : never> => {
	const original = obj[method];
	const mock = createMock(original as any);
	obj[method] = mock as any;
	return mock;
};

/**
 * Restore original method
 */
export const restore = <T extends Record<string, unknown>, K extends keyof T>(
	obj: T,
	method: K,
	original: unknown,
): void => {
	obj[method] = original as any;
};
