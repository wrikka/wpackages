import { describe, expect, it } from "vitest";
import { exponentialSearch } from "./exponential-search";

describe("exponentialSearch", () => {
	it("should find the index of a target in a sorted number array", () => {
		const arr = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
		expect(exponentialSearch(arr, 14)).toBe(6);
	});

	it("should find the index of a target in a sorted string array", () => {
		const arr = ["apple", "banana", "cherry", "date", "fig"];
		expect(exponentialSearch(arr, "cherry")).toBe(2);
	});

	it("should return -1 if the target is not in the array", () => {
		const arr = [2, 4, 6, 8, 10];
		expect(exponentialSearch(arr, 7)).toBe(-1);
	});

	it("should return -1 for an empty array", () => {
		const arr: number[] = [];
		expect(exponentialSearch(arr, 5)).toBe(-1);
	});

	it("should handle an array with a single element", () => {
		const arr = [10];
		expect(exponentialSearch(arr, 10)).toBe(0);
		expect(exponentialSearch(arr, 5)).toBe(-1);
	});

	it("should find the target if it is the first element", () => {
		const arr = [5, 10, 15, 20];
		expect(exponentialSearch(arr, 5)).toBe(0);
	});

	it("should find the target if it is the last element", () => {
		const arr = [5, 10, 15, 20, 25];
		expect(exponentialSearch(arr, 25)).toBe(4);
	});

	it("should work with a larger array", () => {
		const arr = Array.from({ length: 100 }, (_, i) => i * 2); // [0, 2, 4, ..., 198]
		expect(exponentialSearch(arr, 150)).toBe(75);
		expect(exponentialSearch(arr, 198)).toBe(99);
		expect(exponentialSearch(arr, 199)).toBe(-1);
	});
});
