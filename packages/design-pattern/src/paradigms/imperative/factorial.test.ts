import { describe, expect, it } from "vitest";
import { factorial } from "./factorial";

describe("Imperative - Factorial", () => {
	it("should calculate the factorial of a positive number", () => {
		expect(factorial(0)).toBe(1);
		expect(factorial(1)).toBe(1);
		expect(factorial(5)).toBe(120);
		expect(factorial(10)).toBe(3628800);
	});

	it("should throw an error for negative numbers", () => {
		expect(() => factorial(-1)).toThrow("Factorial is not defined for negative numbers.");
	});
});
