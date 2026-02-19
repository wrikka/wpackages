import { describe, expect, it } from "vitest";
import { quickSort } from "./quick-sort";

describe("quickSort", () => {
	it("should sort an array of numbers", () => {
		const arr = [64, 34, 25, 12, 22, 11, 90];
		expect(quickSort(arr)).toEqual([11, 12, 22, 25, 34, 64, 90]);
	});

	it("should sort an array of strings", () => {
		const arr = ["banana", "apple", "cherry", "date"];
		expect(quickSort(arr)).toEqual(["apple", "banana", "cherry", "date"]);
	});

	it("should handle an already sorted array", () => {
		const arr = [1, 2, 3, 4, 5];
		expect(quickSort(arr)).toEqual([1, 2, 3, 4, 5]);
	});

	it("should handle a reverse-sorted array", () => {
		const arr = [5, 4, 3, 2, 1];
		expect(quickSort(arr)).toEqual([1, 2, 3, 4, 5]);
	});

	it("should handle an array with duplicate elements", () => {
		const arr = [5, 2, 8, 2, 5, 1];
		expect(quickSort(arr)).toEqual([1, 2, 2, 5, 5, 8]);
	});

	it("should handle an array with a single element", () => {
		const arr = [42];
		expect(quickSort(arr)).toEqual([42]);
	});

	it("should return an empty array for an empty input array", () => {
		const arr: number[] = [];
		expect(quickSort(arr)).toEqual([]);
	});

	it("should sort an array with negative numbers", () => {
		const arr = [-10, 20, -30, 0, 5];
		expect(quickSort(arr)).toEqual([-30, -10, 0, 5, 20]);
	});
});
