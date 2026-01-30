import { describe, expect, it } from "vitest";
import { kadanesAlgorithm } from "./kadanes-algorithm";

describe("kadanesAlgorithm", () => {
	it("should find the maximum subarray sum in an array with positive and negative numbers", () => {
		const arr = [-2, 1, -3, 4, -1, 2, 1, -5, 4];
		expect(kadanesAlgorithm(arr)).toBe(6); // [4, -1, 2, 1]
	});

	it("should return the largest number if all numbers are negative", () => {
		const arr = [-1, -2, -3, -4, -5];
		expect(kadanesAlgorithm(arr)).toBe(-1);
	});

	it("should return the sum of all numbers if all are positive", () => {
		const arr = [1, 2, 3, 4, 5];
		expect(kadanesAlgorithm(arr)).toBe(15);
	});

	it("should return 0 for an empty array", () => {
		const arr: number[] = [];
		expect(kadanesAlgorithm(arr)).toBe(0);
	});

	it("should handle an array with a single element", () => {
		const arr = [5];
		expect(kadanesAlgorithm(arr)).toBe(5);

		const arr2 = [-5];
		expect(kadanesAlgorithm(arr2)).toBe(-5);
	});

	it("should handle an array with all zeros", () => {
		const arr = [0, 0, 0, 0];
		expect(kadanesAlgorithm(arr)).toBe(0);
	});
});
