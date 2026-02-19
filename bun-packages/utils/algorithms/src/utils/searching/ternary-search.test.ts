import { describe, expect, it } from "vitest";
import { ternarySearch } from "./ternary-search";

describe("ternarySearch", () => {
	it("should find the index of a target in a sorted array", () => {
		const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		expect(ternarySearch(arr, 6)).toBe(5);
	});

	it("should return -1 if the target is not in the array", () => {
		const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		expect(ternarySearch(arr, 11)).toBe(-1);
	});

	it("should return -1 for an empty array", () => {
		const arr: number[] = [];
		expect(ternarySearch(arr, 5)).toBe(-1);
	});

	it("should find the first element", () => {
		const arr = [1, 2, 3, 4, 5];
		expect(ternarySearch(arr, 1)).toBe(0);
	});

	it("should find the last element", () => {
		const arr = [1, 2, 3, 4, 5];
		expect(ternarySearch(arr, 5)).toBe(4);
	});
});
