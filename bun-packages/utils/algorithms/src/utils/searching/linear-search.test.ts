import { describe, expect, it } from "vitest";
import { linearSearch } from "./linear-search";

describe("linearSearch", () => {
	it("should find the index of a target in an array", () => {
		const arr = [5, 3, 8, 1, 2, 7];
		expect(linearSearch(arr, 8)).toBe(2);
	});

	it("should return -1 if the target is not in the array", () => {
		const arr = [5, 3, 8, 1, 2, 7];
		expect(linearSearch(arr, 9)).toBe(-1);
	});

	it("should return -1 for an empty array", () => {
		const arr: number[] = [];
		expect(linearSearch(arr, 5)).toBe(-1);
	});

	it("should find the first occurrence of the target", () => {
		const arr = [1, 2, 3, 2, 4];
		expect(linearSearch(arr, 2)).toBe(1);
	});

	it("should handle arrays with different types", () => {
		const arr = ["a", "b", "c", "d"];
		expect(linearSearch(arr, "c")).toBe(2);
	});
});
