import { describe, expect, it } from "vitest";
import { cycleSort } from "./cycle-sort";

describe("cycleSort", () => {
	it("should sort an array in ascending order", () => {
		const arr = [64, 34, 25, 12, 22, 11, 90];
		expect(cycleSort(arr)).toEqual([11, 12, 22, 25, 34, 64, 90]);
	});

	it("should not modify the original array", () => {
		const arr = [64, 34, 25, 12, 22, 11, 90];
		const original = [...arr];
		cycleSort(arr);
		expect(arr).toEqual(original);
	});

	it("should handle an empty array", () => {
		expect(cycleSort([])).toEqual([]);
	});

	it("should handle an array with one element", () => {
		expect(cycleSort([5])).toEqual([5]);
	});

	it("should handle an array with duplicate values", () => {
		const arr = [3, 1, 4, 1, 5, 9, 2, 6, 5];
		expect(cycleSort(arr)).toEqual([1, 1, 2, 3, 4, 5, 5, 6, 9]);
	});
});
