import { describe, expect, it } from "vitest";
import { coinChange } from "./coin-change";

describe("coinChange", () => {
	it("should find the minimum number of coins", () => {
		expect(coinChange([1, 2, 5], 11)).toBe(3);
		expect(coinChange([2], 3)).toBe(-1);
	});

	it("should handle amount of 0", () => {
		expect(coinChange([1, 2, 5], 0)).toBe(0);
	});

	it("should handle impossible amounts", () => {
		expect(coinChange([2], 1)).toBe(-1);
	});
});
