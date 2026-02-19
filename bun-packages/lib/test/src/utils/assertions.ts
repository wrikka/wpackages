/**
 * Fluent assertion API for type-safe testing
 */

import type { ZodSchema } from "zod";
import { AssertionError } from "../error";
import type { AssertionOptions } from "../types";
import { toContain, toContainString } from "./assertions/collections";
import { toBe, toEqual } from "./assertions/equality";
import { toBeInstanceOf } from "./assertions/instance";
import { toHaveBeenCalled, toHaveBeenCalledWith } from "./assertions/mock";
import { toMatchObject } from "./assertions/object";
import { toReject, toResolve } from "./assertions/promises";
import { toMatchSchema } from "./assertions/schema";
import { toMatchSnapshot } from "./assertions/snapshot";
import { toThrow, toThrowAsync } from "./assertions/throws";
import { toBeFalsy, toBeNull, toBeTruthy, toBeUndefined } from "./assertions/truthiness";
import { toBeType } from "./assertions/types";

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

	toMatchSchema(schema: ZodSchema<any>, options?: AssertionOptions): void {
		toMatchSchema(this._value, schema, options);
	}

	toHaveBeenCalled(options?: AssertionOptions): void {
		toHaveBeenCalled(this._value as any, options);
	}

	toHaveBeenCalledWith(...args: any[]): void {
		// Note: options are not supported here as the last arg could be an options object
		toHaveBeenCalledWith(this._value as any, ...args);
	}

	toMatchSnapshot(hint?: string): void {
		toMatchSnapshot(this._value, hint);
	}

	toMatchObject(expected: object): void {
		toMatchObject(this._value, expected);
	}

	get not(): Assertion<T> {
		return new NotAssertion(this._value, this._message);
	}
}

/**
 * Negated assertion
 */
class NotAssertion<T> extends Assertion<T> {
	private _negateSync(superCall: () => void, message: string, expected?: unknown, actual?: unknown) {
		try {
			superCall();
		} catch {
			return; // Expected to fail
		}
		throw new AssertionError(message, expected, actual ?? this._value);
	}

	private async _negateAsync(superCall: () => Promise<void>, message: string, expected?: unknown, actual?: unknown) {
		try {
			await superCall();
		} catch {
			return; // Expected to fail
		}
		throw new AssertionError(message, expected, actual ?? this._value);
	}

	override toEqual(expected: T, options?: AssertionOptions): void {
		this._negateSync(
			() => super.toEqual(expected, options),
			options?.message || "Expected values to not be equal",
			expected,
		);
	}

	override toBe(expected: T, options?: AssertionOptions): void {
		this._negateSync(
			() => super.toBe(expected, options),
			options?.message || "Expected values to not be strictly equal",
			expected,
		);
	}

	override toBeTruthy(options?: AssertionOptions): void {
		this._negateSync(() => super.toBeTruthy(options), options?.message || "Expected value to not be truthy", false);
	}

	override toBeFalsy(options?: AssertionOptions): void {
		this._negateSync(() => super.toBeFalsy(options), options?.message || "Expected value to not be falsy", true);
	}

	override toContain(item: unknown, options?: AssertionOptions): void {
		this._negateSync(
			() => super.toContain(item, options),
			options?.message || "Expected array to not contain item",
			item,
		);
	}

	override toBeNull(options?: AssertionOptions): void {
		this._negateSync(() => super.toBeNull(options), options?.message || "Expected value to not be null", null);
	}

	override toBeUndefined(options?: AssertionOptions): void {
		this._negateSync(
			() => super.toBeUndefined(options),
			options?.message || "Expected value to not be undefined",
			undefined,
		);
	}

	override toContainString(substring: string, options?: AssertionOptions): void {
		this._negateSync(
			() => super.toContainString(substring, options),
			options?.message || `Expected string to not contain "${substring}"`,
			substring,
		);
	}

	override toBeInstanceOf(expected: any, options?: AssertionOptions): void {
		this._negateSync(
			() => super.toBeInstanceOf(expected, options),
			options?.message || "Expected value to not be instance of class",
			expected,
		);
	}

	override async toThrowAsync(options?: AssertionOptions): Promise<void> {
		try {
			await super.toThrowAsync(options);
		} catch (error) {
			if (error instanceof AssertionError) {
				return; // Expected to fail because the function did not throw.
			}
			throw error; // Re-throw unexpected errors.
		}
		throw new AssertionError(options?.message || "Expected function to not throw", "no error", "error thrown");
	}

	override async toResolve(options?: AssertionOptions): Promise<void> {
		await this._negateAsync(
			() => super.toResolve(options),
			options?.message || "Expected promise to not resolve",
			"reject",
			"resolve",
		);
	}

	override async toReject(options?: AssertionOptions): Promise<void> {
		await this._negateAsync(
			() => super.toReject(options),
			options?.message || "Expected promise to not reject",
			"resolve",
			"reject",
		);
	}

	override toHaveBeenCalled(options?: AssertionOptions): void {
		this._negateSync(
			() => super.toHaveBeenCalled(options),
			options?.message || "Expected mock function to not have been called",
		);
	}

	override toHaveBeenCalledWith(...args: any[]): void {
		this._negateSync(
			() => super.toHaveBeenCalledWith(...args),
			`Expected mock function to not have been called with arguments: ${JSON.stringify(args)}`,
		);
	}

	override toMatchObject(expected: object): void {
		this._negateSync(
			() => super.toMatchObject(expected),
			"Expected object to not match subset",
			expected,
		);
	}
}

/**
 * Create assertion
 */
export const expect = <T>(value: T, message?: string): Assertion<T> => {
	return new Assertion(value, message);
};
