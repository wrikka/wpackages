import { describe, expect, it } from "vitest";
import { shellSort } from "./shell-sort";

describe("shellSort", () => {
	it("should sort an array in ascending order", () => {
		const arr = [64, 34, 25, 12, 22, 11, 90];
		expect(shellSort(arr)).toEqual([11, 12, 22, 25, 34, 64, 90]);
	});

	it("should not modify the original array", () => {
		const arr = [64, 34, 25, 12, 22, 11, 90];
		const original = [...arr];
		shellSort(arr);
		expect(arr).toEqual(original);
	});

	it("should handle an empty array", () => {
		expect(shellSort([])).toEqual([]);
	});

	it("should handle an array with one element", () => {
		expect(shellSort([5])).toEqual([5]);
	});

	it("should handle an already sorted array", () => {
		const arr = [1, 2, 3, 4, 5];
		expect(shellSort(arr)).toEqual([1, 2, 3, 4, 5]);
	});

	it("should handle an array with duplicate values", () => {
		const arr = [3, 1, 4, 1, 5, 9, 2, 6, 5];
		expect(shellSort(arr)).toEqual([1, 1, 2, 3, 4, 5, 5, 6, 9]);
	});
});
