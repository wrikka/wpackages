import { describe, expect, it } from "vitest";
import { jumpSearch } from "./jump-search";

describe("jumpSearch", () => {
	it("should find the index of a target in a sorted number array", () => {
		const arr = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
		expect(jumpSearch(arr, 55)).toBe(10);
	});

	it("should find the index of a target in a sorted string array", () => {
		const arr = ["apple", "banana", "cherry", "date", "fig", "grape"];
		expect(jumpSearch(arr, "date")).toBe(3);
	});

	it("should return -1 if the target is not in the array", () => {
		const arr = [0, 1, 2, 3, 5, 8];
		expect(jumpSearch(arr, 4)).toBe(-1);
	});

	it("should return -1 for an empty array", () => {
		const arr: number[] = [];
		expect(jumpSearch(arr, 5)).toBe(-1);
	});

	it("should handle an array with a single element", () => {
		const arr = [10];
		expect(jumpSearch(arr, 10)).toBe(0);
		expect(jumpSearch(arr, 5)).toBe(-1);
	});

	it("should find the target if it is the first element", () => {
		const arr = [5, 10, 15, 20];
		expect(jumpSearch(arr, 5)).toBe(0);
	});

	it("should find the target if it is the last element", () => {
		const arr = [5, 10, 15, 20, 25];
		expect(jumpSearch(arr, 25)).toBe(4);
	});

	it("should work with a larger array", () => {
		const arr = Array.from({ length: 100 }, (_, i) => i);
		expect(jumpSearch(arr, 99)).toBe(99);
		expect(jumpSearch(arr, 50)).toBe(50);
		expect(jumpSearch(arr, -1)).toBe(-1);
	});
});
