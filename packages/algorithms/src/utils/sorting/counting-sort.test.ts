import { describe, expect, it } from "vitest";
import { countingSort } from "./counting-sort";

describe("countingSort", () => {
	it("should sort an array of positive integers", () => {
		const arr = [4, 2, 2, 8, 3, 3, 1];
		expect(countingSort(arr)).toEqual([1, 2, 2, 3, 3, 4, 8]);
	});

	it("should handle an already sorted array", () => {
		const arr = [1, 2, 3, 4, 5];
		expect(countingSort(arr)).toEqual([1, 2, 3, 4, 5]);
	});

	it("should handle a reverse-sorted array", () => {
		const arr = [5, 4, 3, 2, 1];
		expect(countingSort(arr)).toEqual([1, 2, 3, 4, 5]);
	});

	it("should handle an array with all same elements", () => {
		const arr = [2, 2, 2, 2, 2];
		expect(countingSort(arr)).toEqual([2, 2, 2, 2, 2]);
	});

	it("should handle an array with a single element", () => {
		const arr = [42];
		expect(countingSort(arr)).toEqual([42]);
	});

	it("should return an empty array for an empty input array", () => {
		const arr: number[] = [];
		expect(countingSort(arr)).toEqual([]);
	});

	it("should sort an array containing zero", () => {
		const arr = [5, 0, 3, 1, 2, 4];
		expect(countingSort(arr)).toEqual([0, 1, 2, 3, 4, 5]);
	});
});
