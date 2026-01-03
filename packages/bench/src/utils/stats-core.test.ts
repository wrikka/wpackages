import { describe, expect, it } from "vitest";
import {
	calculatePercentiles,
	calculateStatistics,
	marginOfError,
	max,
	mean,
	median,
	min,
	opsPerSecond,
	percentile,
	relativeMarginOfError,
	standardDeviation,
	standardError,
	variance,
} from "./stats-core";

describe("stats-core", () => {
	describe("mean", () => {
		it("should calculate mean correctly", () => {
			expect(mean([1, 2, 3, 4, 5])).toBe(3);
		});

		it("should handle empty array", () => {
			expect(mean([])).toBe(0);
		});

		it("should handle single value", () => {
			expect(mean([42])).toBe(42);
		});

		it("should handle negative numbers", () => {
			expect(mean([-5, -3, -1])).toBe(-3);
		});

		it("should handle decimal numbers", () => {
			expect(mean([1.5, 2.5, 3.5])).toBe(2.5);
		});
	});

	describe("min", () => {
		it("should find minimum value", () => {
			expect(min([5, 2, 8, 1, 9])).toBe(1);
		});

		it("should handle empty array", () => {
			expect(min([])).toBe(0);
		});

		it("should handle single value", () => {
			expect(min([42])).toBe(42);
		});

		it("should handle negative numbers", () => {
			expect(min([-5, -3, -1, -10])).toBe(-10);
		});
	});

	describe("max", () => {
		it("should find maximum value", () => {
			expect(max([5, 2, 8, 1, 9])).toBe(9);
		});

		it("should handle empty array", () => {
			expect(max([])).toBe(0);
		});

		it("should handle single value", () => {
			expect(max([42])).toBe(42);
		});

		it("should handle negative numbers", () => {
			expect(max([-5, -3, -1])).toBe(-1);
		});
	});

	describe("median", () => {
		it("should calculate median for odd length array", () => {
			expect(median([1, 2, 3, 4, 5])).toBe(3);
		});

		it("should calculate median for even length array", () => {
			expect(median([1, 2, 3, 4])).toBe(2.5);
		});

		it("should handle empty array", () => {
			expect(median([])).toBe(0);
		});

		it("should handle single value", () => {
			expect(median([42])).toBe(42);
		});

		it("should handle unsorted array", () => {
			expect(median([5, 1, 3, 2, 4])).toBe(3);
		});
	});

	describe("variance", () => {
		it("should calculate variance", () => {
			const result = variance([1, 2, 3, 4, 5]);
			expect(result).toBeCloseTo(2.5, 1);
		});

		it("should handle empty array", () => {
			expect(variance([])).toBe(0);
		});

		it("should return 0 for identical values", () => {
			expect(variance([5, 5, 5, 5])).toBe(0);
		});
	});

	describe("standardDeviation", () => {
		it("should calculate standard deviation", () => {
			const result = standardDeviation([1, 2, 3, 4, 5]);
			expect(result).toBeCloseTo(1.581, 1);
		});

		it("should handle empty array", () => {
			expect(standardDeviation([])).toBe(0);
		});

		it("should return 0 for identical values", () => {
			expect(standardDeviation([5, 5, 5, 5])).toBe(0);
		});
	});

	describe("standardError", () => {
		it("should calculate standard error", () => {
			const result = standardError([1, 2, 3, 4, 5]);
			expect(result).toBeGreaterThan(0);
		});

		it("should handle empty array", () => {
			expect(standardError([])).toBe(0);
		});

		it("should decrease with larger sample size from the same distribution", () => {
			const smallSample = standardError([4, 5, 6]); // variance = 1
			const largeSample = standardError([4, 4, 5, 5, 6, 6]); // variance = 0.8
			expect(smallSample).toBeGreaterThan(largeSample);
		});
	});

	describe("marginOfError", () => {
		it("should calculate margin of error with 95% confidence", () => {
			const result = marginOfError([1, 2, 3, 4, 5], 0.95);
			expect(result).toBeGreaterThan(0);
		});

		it("should calculate margin of error with 99% confidence", () => {
			const result = marginOfError([1, 2, 3, 4, 5], 0.99);
			expect(result).toBeGreaterThan(0);
		});

		it("should have larger margin with 99% vs 95%", () => {
			const moe95 = marginOfError([1, 2, 3, 4, 5], 0.95);
			const moe99 = marginOfError([1, 2, 3, 4, 5], 0.99);
			expect(moe99).toBeGreaterThan(moe95);
		});
	});

	describe("relativeMarginOfError", () => {
		it("should calculate relative margin of error as percentage", () => {
			const result = relativeMarginOfError([10, 11, 12, 13, 14], 0.95);
			expect(result).toBeGreaterThan(0);
			expect(result).toBeLessThan(100);
		});

		it("should return 0 for empty array", () => {
			expect(relativeMarginOfError([], 0.95)).toBe(0);
		});
	});

	describe("percentile", () => {
		it("should calculate 50th percentile (median)", () => {
			expect(percentile([1, 2, 3, 4, 5], 50)).toBe(3);
		});

		it("should calculate 25th percentile", () => {
			const result = percentile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 25);
			expect(result).toBeCloseTo(3.25, 1);
		});

		it("should calculate 75th percentile", () => {
			const result = percentile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 75);
			expect(result).toBeCloseTo(7.75, 1);
		});

		it("should calculate 95th percentile", () => {
			const result = percentile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 95);
			expect(result).toBeCloseTo(9.55, 1);
		});

		it("should handle empty array", () => {
			expect(percentile([], 50)).toBe(0);
		});

		it("should handle invalid percentile (< 0)", () => {
			expect(percentile([1, 2, 3], -1)).toBe(0);
		});

		it("should handle invalid percentile (> 100)", () => {
			expect(percentile([1, 2, 3], 101)).toBe(0);
		});
	});

	describe("calculatePercentiles", () => {
		it("should calculate all percentiles", () => {
			const result = calculatePercentiles([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
			expect(result.p25).toBeCloseTo(3.25, 1);
			expect(result.p50).toBe(5.5);
			expect(result.p75).toBeCloseTo(7.75, 1);
			expect(result.p90).toBeCloseTo(9.1, 1);
			expect(result.p95).toBeCloseTo(9.55, 1);
			expect(result.p99).toBeCloseTo(9.91, 1);
		});

		it("should handle empty array", () => {
			const result = calculatePercentiles([]);
			expect(result.p25).toBe(0);
			expect(result.p50).toBe(0);
			expect(result.p75).toBe(0);
		});
	});

	describe("calculateStatistics", () => {
		it("should calculate all statistics", () => {
			const values = [1, 2, 3, 4, 5];
			const result = calculateStatistics(values, 0.95);

			expect(result.min).toBe(1);
			expect(result.max).toBe(5);
			expect(result.mean).toBe(3);
			expect(result.median).toBe(3);
			expect(result.variance).toBeCloseTo(2.5, 1);
			expect(result.standardDeviation).toBeCloseTo(1.581, 1);
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

	describe("opsPerSecond", () => {
		it("should calculate ops per second from milliseconds", () => {
			expect(opsPerSecond(1)).toBe(1000);
			expect(opsPerSecond(10)).toBe(100);
			expect(opsPerSecond(100)).toBe(10);
		});

		it("should handle zero", () => {
			expect(opsPerSecond(0)).toBe(0);
		});

		it("should handle very small times (fast operations)", () => {
			expect(opsPerSecond(0.1)).toBe(10000);
			expect(opsPerSecond(0.01)).toBe(100000);
		});

		it("should handle decimal times", () => {
			expect(opsPerSecond(2.5)).toBe(400);
		});
	});
});
