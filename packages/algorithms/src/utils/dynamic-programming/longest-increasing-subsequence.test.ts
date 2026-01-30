import { describe, expect, it } from "vitest";
import { longestIncreasingSubsequence } from "./longest-increasing-subsequence";

describe("longestIncreasingSubsequence", () => {
	it("should find the longest increasing subsequence", () => {
		const arr = [10, 22, 9, 33, 21, 50, 41, 60];
		const lis = longestIncreasingSubsequence(arr);
		expect(lis.length).toBe(5);
		expect(lis).toEqual([10, 22, 33, 50, 60]);
	});

	it("should handle an empty array", () => {
		expect(longestIncreasingSubsequence([])).toEqual([]);
	});

	it("should handle an array with one element", () => {
		expect(longestIncreasingSubsequence([5])).toEqual([5]);
	});

	it("should handle a decreasing array", () => {
		const arr = [5, 4, 3, 2, 1];
		const lis = longestIncreasingSubsequence(arr);
		expect(lis.length).toBe(1);
	});
});
