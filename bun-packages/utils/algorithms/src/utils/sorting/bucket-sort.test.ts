import { describe, expect, it } from "vitest";
import { bucketSort } from "./bucket-sort";

describe("bucketSort", () => {
	it("should sort an array in ascending order", () => {
		const arr = [64, 34, 25, 12, 22, 11, 90];
		expect(bucketSort(arr)).toEqual([11, 12, 22, 25, 34, 64, 90]);
	});

	it("should handle an empty array", () => {
		expect(bucketSort([])).toEqual([]);
	});

	it("should handle an array with one element", () => {
		expect(bucketSort([5])).toEqual([5]);
	});

	it("should handle an array with duplicate values", () => {
		const arr = [3, 1, 4, 1, 5, 9, 2, 6, 5];
		expect(bucketSort(arr)).toEqual([1, 1, 2, 3, 4, 5, 5, 6, 9]);
	});

	it("should handle arrays with negative values", () => {
		const arr = [-5, 3, -2, 8, 0, -1];
		expect(bucketSort(arr)).toEqual([-5, -2, -1, 0, 3, 8]);
	});
});
