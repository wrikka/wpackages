/**
 * Fluent assertion API for type-safe testing
 */

import type { AssertionOptions } from "../types";

/**
 * Assertion error
 */
export class AssertionError extends Error {
	constructor(
		message: string,
		public expected?: unknown,
		public actual?: unknown,
	) {
		super(message);
		this.name = "AssertionError";
	}
}

/**
 * Helper to throw assertion error if condition fails
 */
const throwIfFails = (
	pass: boolean,
	message: string,
	expected?: unknown,
	actual?: unknown,
): void => {
	if (!pass) {
		throw new AssertionError(message, expected, actual);
	}
};

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

	/**
	 * Equality assertion
	 */
	toEqual(expected: T, options?: AssertionOptions): void {
		const pass = JSON.stringify(this._value) === JSON.stringify(expected);
		throwIfFails(
			pass,
			options?.message || "Expected values to be equal",
			expected,
			this._value,
		);
	}

	/**
	 * Strict equality assertion
	 */
	toBe(expected: T, options?: AssertionOptions): void {
		const pass = Object.is(this._value, expected);
		throwIfFails(
			pass,
			options?.message || "Expected values to be strictly equal",
			expected,
			this._value,
		);
	}

	/**
	 * Truthiness assertion
	 */
	toBeTruthy(options?: AssertionOptions): void {
		const pass = !!this._value;
		throwIfFails(
			pass,
			options?.message || "Expected value to be truthy",
			true,
			this._value,
		);
	}

	/**
	 * Falsiness assertion
	 */
	toBeFalsy(options?: AssertionOptions): void {
		const pass = !this._value;
		throwIfFails(
			pass,
			options?.message || "Expected value to be falsy",
			false,
			this._value,
		);
	}

	/**
	 * Null assertion
	 */
	toBeNull(options?: AssertionOptions): void {
		const pass = this._value === null;
		throwIfFails(
			pass,
			options?.message || "Expected value to be null",
			null,
			this._value,
		);
	}

	/**
	 * Undefined assertion
	 */
	toBeUndefined(options?: AssertionOptions): void {
		const pass = this._value === undefined;
		throwIfFails(
			pass,
			options?.message || "Expected value to be undefined",
			undefined,
			this._value,
		);
	}

	/**
	 * Type assertion
	 */
	toBeType(type: string, options?: AssertionOptions): void {
		const pass = typeof this._value === type;
		throwIfFails(
			pass,
			options?.message || `Expected value to be of type ${type}`,
			type,
			typeof this._value,
		);
	}

	/**
	 * Array contains assertion
	 */
	toContain(item: unknown, options?: AssertionOptions): void {
		if (!Array.isArray(this._value)) {
			throw new AssertionError(
				options?.message || "Expected value to be an array",
			);
		}
		const pass = this._value.includes(item as T);
		throwIfFails(
			pass,
			options?.message || "Expected array to contain item",
			item,
			this._value,
		);
	}

	/**
	 * String contains assertion
	 */
	toContainString(substring: string, options?: AssertionOptions): void {
		if (typeof this._value !== "string") {
			throw new AssertionError(
				options?.message || "Expected value to be a string",
			);
		}
		const pass = (this._value as unknown as string).includes(substring);
		throwIfFails(
			pass,
			options?.message || "Expected string to contain substring",
			substring,
			this._value,
		);
	}

	/**
	 * Throws assertion
	 */
	toThrow(options?: AssertionOptions): void {
		if (typeof this._value !== "function") {
			throw new AssertionError(
				options?.message || "Expected value to be a function",
			);
		}
		try {
			(this._value as Function)();
			throw new AssertionError(
				options?.message || "Expected function to throw",
			);
		} catch (error) {
			if (error instanceof AssertionError) {
				throw error;
			}
			// Function threw as expected
		}
	}

	/**
	 * Async throws assertion
	 */
	async toThrowAsync(options?: AssertionOptions): Promise<void> {
		if (typeof this._value !== "function") {
			throw new AssertionError(
				options?.message || "Expected value to be a function",
			);
		}
		try {
			await (this._value as Function)();
			throw new AssertionError(
				options?.message || "Expected function to throw",
			);
		} catch (error) {
			if (error instanceof AssertionError) {
				throw error;
			}
			// Function threw as expected
		}
	}

	/**
	 * Resolves assertion
	 */
	async toResolve(options?: AssertionOptions): Promise<void> {
		if (!(this._value instanceof Promise)) {
			throw new AssertionError(
				options?.message || "Expected value to be a Promise",
			);
		}
		try {
			await this._value;
		} catch (error) {
			throw new AssertionError(
				options?.message || "Expected promise to resolve",
				undefined,
				error,
			);
		}
	}

	/**
	 * Rejects assertion
	 */
	async toReject(options?: AssertionOptions): Promise<void> {
		if (!(this._value instanceof Promise)) {
			throw new AssertionError(
				options?.message || "Expected value to be a Promise",
			);
		}
		try {
			await this._value;
			throw new AssertionError(
				options?.message || "Expected promise to reject",
			);
		} catch (error) {
			if (error instanceof AssertionError) {
				throw error;
			}
			// Promise rejected as expected
		}
	}

	/**
	 * Not assertion
	 */
	get not(): Assertion<T> {
		return new NotAssertion(this._value, this._message);
	}
}

/**
 * Negated assertion
 */
class NotAssertion<T> extends Assertion<T> {
	override toEqual(expected: T, options?: AssertionOptions): void {
		const pass = JSON.stringify(this._value) !== JSON.stringify(expected);
		if (!pass) {
			throw new AssertionError(
				options?.message || "Expected values to not be equal",
				expected,
				this._value,
			);
		}
	}

	override toBe(expected: T, options?: AssertionOptions): void {
		const pass = !Object.is(this._value, expected);
		if (!pass) {
			throw new AssertionError(
				options?.message || "Expected values to not be strictly equal",
				expected,
				this._value,
			);
		}
	}

	override toBeTruthy(options?: AssertionOptions): void {
		const pass = !this._value;
		if (!pass) {
			throw new AssertionError(
				options?.message || "Expected value to not be truthy",
				false,
				this._value,
			);
		}
	}

	override toBeFalsy(options?: AssertionOptions): void {
		const pass = !!this._value;
		if (!pass) {
			throw new AssertionError(
				options?.message || "Expected value to not be falsy",
				true,
				this._value,
			);
		}
	}

	override toContain(item: unknown, options?: AssertionOptions): void {
		if (!Array.isArray(this._value)) {
			throw new AssertionError(
				options?.message || "Expected value to be an array",
			);
		}
		const pass = !(this._value as unknown[]).includes(item);
		if (!pass) {
			throw new AssertionError(
				options?.message || "Expected array to not contain item",
				item,
				this._value,
			);
		}
	}
}

/**
 * Create assertion
 */
export const expect = <T>(value: T, message?: string): Assertion<T> => {
	return new Assertion(value, message);
};
