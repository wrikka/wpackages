import { describe, expect, it } from "vitest";
import { standardDeviation } from "../stats-core";

describe("standardDeviation", () => {
	it("should calculate standard deviation", () => {
		const result = standardDeviation([1, 2, 3, 4, 5]);
		expect(result).toBeCloseTo(1.414, 1);
	});

	it("should handle empty array", () => {
		expect(standardDeviation([])).toBe(0);
	});

	it("should return 0 for identical values", () => {
		expect(standardDeviation([5, 5, 5, 5])).toBe(0);
	});
});
