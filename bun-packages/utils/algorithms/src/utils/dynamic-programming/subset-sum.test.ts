import { describe, expect, it } from "vitest";
import { subsetSum } from "./subset-sum";

describe("subsetSum", () => {
	it("should check if a subset sums to target", () => {
		expect(subsetSum([3, 34, 4, 12, 5, 2], 9)).toBe(true);
		expect(subsetSum([3, 34, 4, 12, 5, 2], 30)).toBe(false);
	});

	it("should handle target of 0", () => {
		expect(subsetSum([1, 2, 3], 0)).toBe(true);
	});

	it("should handle empty array", () => {
		expect(subsetSum([], 5)).toBe(false);
	});
});
