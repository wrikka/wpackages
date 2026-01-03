/**
 * Fluent assertion API for type-safe testing
 */

import type { AssertionOptions } from "../types";
import { toContain, toContainString } from "./assertions/collections";
import { toBe, toEqual } from "./assertions/equality";
import { toBeInstanceOf } from "./assertions/instance";
import { toReject, toResolve } from "./assertions/promises";
import { toThrow, toThrowAsync } from "./assertions/throws";
import { toBeFalsy, toBeNull, toBeTruthy, toBeUndefined } from "./assertions/truthiness";
import { toBeType } from "./assertions/types";
import { AssertionError } from "./error";

/**
 * Fluent assertion builder
 */
export class Assertion<T> {
	protected _value: T;
	protected _message: string | undefined;

	constructor(value: T, message?: string) {
		this._value = value;
		this._message = message;
	}

	toEqual(expected: T, options?: AssertionOptions): void {
		toEqual(this._value, expected, options);
	}

	toBe(expected: T, options?: AssertionOptions): void {
		toBe(this._value, expected, options);
	}

	toBeTruthy(options?: AssertionOptions): void {
		toBeTruthy(this._value, options);
	}

	toBeFalsy(options?: AssertionOptions): void {
		toBeFalsy(this._value, options);
	}

	toBeNull(options?: AssertionOptions): void {
		toBeNull(this._value, options);
	}

	toBeUndefined(options?: AssertionOptions): void {
		toBeUndefined(this._value, options);
	}

	toBeType(type: string, options?: AssertionOptions): void {
		toBeType(this._value, type, options);
	}

	toBeInstanceOf(expected: any, options?: AssertionOptions): void {
		toBeInstanceOf(this._value, expected, options);
	}

	toContain(item: unknown, options?: AssertionOptions): void {
		toContain(this._value, item, options);
	}

	toContainString(substring: string, options?: AssertionOptions): void {
		toContainString(this._value, substring, options);
	}

	toThrow(options?: AssertionOptions): void {
		toThrow(this._value, options);
	}

	async toThrowAsync(options?: AssertionOptions): Promise<void> {
		await toThrowAsync(this._value, options);
	}

	async toResolve(options?: AssertionOptions): Promise<void> {
		await toResolve(this._value, options);
	}

	async toReject(options?: AssertionOptions): Promise<void> {
		await toReject(this._value, options);
	}

	get not(): Assertion<T> {
		return new NotAssertion(this._value, this._message);
	}
}

/**
 * Negated assertion
 */
class NotAssertion<T> extends Assertion<T> {
	override toEqual(expected: T, options?: AssertionOptions): void {
		try {
			super.toEqual(expected, options);
		} catch (_) {
			return; // Expected to fail
		}
		throw new AssertionError(options?.message || "Expected values to not be equal", expected, this._value);
	}

	override toBe(expected: T, options?: AssertionOptions): void {
		try {
			super.toBe(expected, options);
		} catch (_) {
			return; // Expected to fail
		}
		throw new AssertionError(options?.message || "Expected values to not be strictly equal", expected, this._value);
	}

	override toBeTruthy(options?: AssertionOptions): void {
		try {
			super.toBeTruthy(options);
		} catch (_) {
			return; // Expected to fail
		}
		throw new AssertionError(options?.message || "Expected value to not be truthy", false, this._value);
	}

	override toBeFalsy(options?: AssertionOptions): void {
		try {
			super.toBeFalsy(options);
		} catch (_) {
			return; // Expected to fail
		}
		throw new AssertionError(options?.message || "Expected value to not be falsy", true, this._value);
	}

	override toContain(item: unknown, options?: AssertionOptions): void {
		try {
			super.toContain(item, options);
		} catch (_) {
			return; // Expected to fail
		}
		throw new AssertionError(options?.message || "Expected array to not contain item", item, this._value);
	}
}

/**
 * Create assertion
 */
export const expect = <T>(value: T, message?: string): Assertion<T> => {
	return new Assertion(value, message);
};
