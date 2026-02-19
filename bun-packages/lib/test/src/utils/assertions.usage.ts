/**
 * Usage examples for assertions
 */

import { expect } from "./assertions";

// Example 1: Basic equality assertions
export const example1_equality = () => {
	// Strict equality
	expect(42).toBe(42);
	expect("hello").toBe("hello");

	// Deep equality
	expect({ name: "John", age: 30 }).toEqual({ name: "John", age: 30 });
	expect([1, 2, 3]).toEqual([1, 2, 3]);
};

// Example 2: Truthiness assertions
export const example2_truthiness = () => {
	expect(true).toBeTruthy();
	expect(1).toBeTruthy();
	expect("hello").toBeTruthy();

	expect(false).toBeFalsy();
	expect(0).toBeFalsy();
	expect("").toBeFalsy();
	expect(null).toBeNull();
	expect(undefined).toBeUndefined();
};

// Example 3: Type checking
export const example3_types = () => {
	expect("hello").toBeType("string");
	expect(42).toBeType("number");
	expect(true).toBeType("boolean");
	expect({}).toBeType("object");
	expect(() => {}).toBeType("function");
};

// Example 4: Collections
export const example4_collections = () => {
	// Array contains
	expect([1, 2, 3, 4, 5]).toContain(3);
	expect(["apple", "banana", "orange"]).toContain("banana");

	// String contains
	expect("hello world").toContainString("world");
	expect("typescript").toContainString("script");

	// Negation
	expect([1, 2, 3]).not.toContain(4);
	expect("hello").not.toContainString("world");
};

// Example 5: Negation with fluent API
export const example5_negation = () => {
	expect(42).not.toBe(43);
	expect({ a: 1 }).not.toEqual({ a: 2 });
	expect(false).not.toBeTruthy();
	expect(0).not.toBeFalsy();
};

// Example 6: Error handling
export const example6_errors = () => {
	const throwingFunction = () => {
		throw new Error("Something went wrong");
	};

	expect(throwingFunction).toThrow();
};

// Example 7: Async operations
export const example7_async = async () => {
	const promise = Promise.resolve(42);
	await expect(promise).toResolve();

	const rejectedPromise = Promise.reject(new Error("Failed"));
	await expect(rejectedPromise).toReject();
};

// Example 8: Custom messages
export const example8_customMessages = () => {
	try {
		expect(42, "Expected 42 to be 43").toBe(43);
	} catch (err) {
		console.log("Caught error with custom message:", (err as Error).message);
	}
};

// Example 9: Chaining assertions
export const example9_chaining = () => {
	// Multiple assertions on same value
	const user = { name: "John", age: 30, active: true };

	expect(user).toEqual({ name: "John", age: 30, active: true });
	expect(user.name).toBeType("string");
	expect(user.age).toBeType("number");
	expect(user.active).toBeTruthy();
};

// Example 10: Real-world test scenario
export const example10_realWorld = () => {
	// Testing a user validation function
	const validateUser = (user: { name: string; email: string; age: number }) => {
		if (!user.name) throw new Error("Name is required");
		if (!user.email) throw new Error("Email is required");
		if (user.age < 18) throw new Error("Must be 18 or older");
		return true;
	};

	// Valid user
	const validUser = { name: "John", email: "john@example.com", age: 25 };
	expect(() => validateUser(validUser)).not.toThrow();

	// Invalid user
	const invalidUser = { name: "Jane", email: "jane@example.com", age: 15 };
	expect(() => validateUser(invalidUser)).toThrow();

	// Check error message
	try {
		validateUser(invalidUser);
	} catch (error) {
		if (error instanceof Error) {
			expect(error.message).toContainString("18 or older");
		}
	}
};
