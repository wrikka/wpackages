import { describe, expect, it } from "vitest";
import { calculatePercentiles, percentile } from "../stats-core";

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
