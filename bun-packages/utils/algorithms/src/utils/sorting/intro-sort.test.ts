import { describe, expect, it } from "vitest";
import { introSort } from "./intro-sort";

describe("introSort", () => {
	it("should sort an array in ascending order", () => {
		const arr = [64, 34, 25, 12, 22, 11, 90];
		expect(introSort(arr)).toEqual([11, 12, 22, 25, 34, 64, 90]);
	});

	it("should not modify the original array", () => {
		const arr = [64, 34, 25, 12, 22, 11, 90];
		const original = [...arr];
		introSort(arr);
		expect(arr).toEqual(original);
	});

	it("should handle an empty array", () => {
		expect(introSort([])).toEqual([]);
	});

	it("should handle an array with one element", () => {
		expect(introSort([5])).toEqual([5]);
	});

	it("should handle an array with duplicate values", () => {
		const arr = [3, 1, 4, 1, 5, 9, 2, 6, 5];
		expect(introSort(arr)).toEqual([1, 1, 2, 3, 4, 5, 5, 6, 9]);
	});
});
