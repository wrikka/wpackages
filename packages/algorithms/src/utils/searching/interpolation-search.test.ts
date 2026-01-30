import { describe, expect, it } from "vitest";
import { interpolationSearch } from "./interpolation-search";

describe("interpolationSearch", () => {
	it("should find the index of a target in a uniformly distributed sorted array", () => {
		const arr = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512];
		expect(interpolationSearch(arr, 64)).toBe(6);
	});

	it("should return -1 if the target is not in the array", () => {
		const arr = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512];
		expect(interpolationSearch(arr, 100)).toBe(-1);
	});

	it("should return -1 for an empty array", () => {
		const arr: number[] = [];
		expect(interpolationSearch(arr, 5)).toBe(-1);
	});

	it("should find the first element", () => {
		const arr = [1, 2, 4, 8, 16];
		expect(interpolationSearch(arr, 1)).toBe(0);
	});

	it("should find the last element", () => {
		const arr = [1, 2, 4, 8, 16];
		expect(interpolationSearch(arr, 16)).toBe(4);
	});
});
