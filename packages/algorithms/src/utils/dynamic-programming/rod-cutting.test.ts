import { describe, expect, it } from "vitest";
import { rodCutting } from "./rod-cutting";

describe("rodCutting", () => {
	it("should find the maximum value for rod cutting", () => {
		const prices = [1, 5, 8, 9, 10, 17, 17, 20];
		expect(rodCutting(prices, 8)).toBe(22);
	});

	it("should handle length of 0", () => {
		expect(rodCutting([1, 5, 8], 0)).toBe(0);
	});

	it("should handle length of 1", () => {
		expect(rodCutting([1, 5, 8], 1)).toBe(1);
	});
});
