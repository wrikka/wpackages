import { describe, expect, it } from "vitest";
import { binarySearch } from "./binary-search";

describe("binarySearch", () => {
	it("should find the index of a target in a sorted number array", () => {
		const arr = [1, 3, 5, 7, 9, 11];
		expect(binarySearch(arr, 5)).toBe(2);
	});

	it("should find the index of a target in a sorted string array", () => {
		const arr = ["a", "b", "c", "d", "e"];
		expect(binarySearch(arr, "c")).toBe(2);
	});

	it("should return -1 if the target is not in the array", () => {
		const arr = [1, 3, 5, 7, 9, 11];
		expect(binarySearch(arr, 6)).toBe(-1);
	});

	it("should return -1 for an empty array", () => {
		const arr: number[] = [];
		expect(binarySearch(arr, 5)).toBe(-1);
	});

	it("should handle an array with a single element", () => {
		const arr = [5];
		expect(binarySearch(arr, 5)).toBe(0);
		expect(binarySearch(arr, 3)).toBe(-1);
	});

	it("should find the target if it is the first element", () => {
		const arr = [1, 3, 5, 7, 9];
		expect(binarySearch(arr, 1)).toBe(0);
	});

	it("should find the target if it is the last element", () => {
		const arr = [1, 3, 5, 7, 9];
		expect(binarySearch(arr, 9)).toBe(4);
	});

	it("should handle arrays with duplicate values", () => {
		const arr = [1, 3, 5, 5, 5, 7, 9];
		// Binary search can return any index of the target if duplicates exist
		expect(binarySearch(arr, 5)).toBeGreaterThanOrEqual(2);
		expect(binarySearch(arr, 5)).toBeLessThanOrEqual(4);
	});
});
