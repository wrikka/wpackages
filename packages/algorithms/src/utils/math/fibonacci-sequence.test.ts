import { describe, expect, it } from "vitest";
import { fibonacci } from "./fibonacci-sequence";

describe("fibonacci", () => {
	it("should return the first 10 numbers of the Fibonacci sequence", () => {
		expect(fibonacci(10)).toEqual([0, 1, 1, 2, 3, 5, 8, 13, 21, 34]);
	});

	it("should return the first 2 numbers for n = 2", () => {
		expect(fibonacci(2)).toEqual([0, 1]);
	});

	it("should return the first number for n = 1", () => {
		expect(fibonacci(1)).toEqual([0]);
	});

	it("should return an empty array for n = 0", () => {
		expect(fibonacci(0)).toEqual([]);
	});

	it("should return an empty array for a negative n", () => {
		expect(fibonacci(-5)).toEqual([]);
	});
});
