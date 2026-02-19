import { describe, expect, it } from "vitest";
import { calculateStatistics } from "../stats-core";

describe("calculateStatistics", () => {
	it("should calculate all statistics", () => {
		const values = [1, 2, 3, 4, 5];
		const result = calculateStatistics(values, 0.95);

		expect(result.min).toBe(1);
		expect(result.max).toBe(5);
		expect(result.mean).toBe(3);
		expect(result.median).toBe(3);
		expect(result.variance).toBeCloseTo(2, 1);
		expect(result.standardDeviation).toBeCloseTo(1.414, 1);
		expect(result.marginOfError).toBeGreaterThan(0);
		expect(result.relativeMarginOfError).toBeGreaterThan(0);
	});

	it("should handle empty array", () => {
		const result = calculateStatistics([]);
		expect(result.min).toBe(0);
		expect(result.max).toBe(0);
		expect(result.mean).toBe(0);
	});

	it("should use different confidence levels", () => {
		const values = [1, 2, 3, 4, 5];
		const stats95 = calculateStatistics(values, 0.95);
		const stats99 = calculateStatistics(values, 0.99);

		expect(stats99.marginOfError).toBeGreaterThan(stats95.marginOfError);
	});
});
