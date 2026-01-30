import { describe, expect, it } from "vitest";
import { variance } from "../stats-core";

describe("variance", () => {
	it("should calculate variance", () => {
		const result = variance([1, 2, 3, 4, 5]);
		expect(result).toBeCloseTo(2, 1);
	});

	it("should handle empty array", () => {
		expect(variance([])).toBe(0);
	});

	it("should return 0 for identical values", () => {
		expect(variance([5, 5, 5, 5])).toBe(0);
	});
});
