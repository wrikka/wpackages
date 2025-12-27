import { describe, expect, it } from "vitest";
import type { BenchResult } from "../types/index";
import {
	calculateRelativePerformance,
	calculateSpeedup,
	findFastest,
	findSlowest,
	groupByPerformanceTier,
	sortByPerformance,
} from "./comparison.utils";

// Helper to create mock BenchResult
const createBenchResult = (name: string, averageTime: number): BenchResult => ({
	name,
	iterations: 100,
	totalTime: averageTime * 100,
	averageTime,
	minTime: averageTime * 0.9,
	maxTime: averageTime * 1.1,
	opsPerSecond: 1000 / averageTime,
	variance: 0.1,
	standardDeviation: 0.3,
});

describe("comparison.utils", () => {
	describe("findFastest", () => {
		it("should find the fastest benchmark", () => {
			const results: BenchResult[] = [
				createBenchResult("Slow", 20),
				createBenchResult("Fast", 10),
				createBenchResult("Medium", 15),
			];

			const fastest = findFastest(results);
			expect(fastest?.name).toBe("Fast");
			expect(fastest?.averageTime).toBe(10);
		});

		it("should return undefined for empty array", () => {
			expect(findFastest([])).toBeUndefined();
		});

		it("should handle single result", () => {
			const results = [createBenchResult("Only", 10)];
			const fastest = findFastest(results);
			expect(fastest?.name).toBe("Only");
		});

		it("should handle equal times", () => {
			const results = [createBenchResult("A", 10), createBenchResult("B", 10)];
			const fastest = findFastest(results);
			expect(fastest?.averageTime).toBe(10);
		});
	});

	describe("findSlowest", () => {
		it("should find the slowest benchmark", () => {
			const results: BenchResult[] = [
				createBenchResult("Fast", 10),
				createBenchResult("Slow", 30),
				createBenchResult("Medium", 20),
			];

			const slowest = findSlowest(results);
			expect(slowest?.name).toBe("Slow");
			expect(slowest?.averageTime).toBe(30);
		});

		it("should return undefined for empty array", () => {
			expect(findSlowest([])).toBeUndefined();
		});

		it("should handle single result", () => {
			const results = [createBenchResult("Only", 10)];
			const slowest = findSlowest(results);
			expect(slowest?.name).toBe("Only");
		});
	});

	describe("calculateRelativePerformance", () => {
		it("should calculate relative performance vs baseline", () => {
			const result = createBenchResult("Test", 20);
			const baseline = createBenchResult("Baseline", 10);

			const comparison = calculateRelativePerformance(result, baseline);

			expect(comparison.name).toBe("Test");
			expect(comparison.relativeTo).toBe(2);
			expect(comparison.percentage).toBe(100);
			expect(comparison.ratio).toBe("2.00x");
		});

		it("should handle faster result", () => {
			const result = createBenchResult("Fast", 10);
			const baseline = createBenchResult("Baseline", 20);

			const comparison = calculateRelativePerformance(result, baseline);

			expect(comparison.relativeTo).toBe(0.5);
			expect(comparison.percentage).toBe(-50);
		});

		it("should handle equal performance", () => {
			const result = createBenchResult("Same", 10);
			const baseline = createBenchResult("Baseline", 10);

			const comparison = calculateRelativePerformance(result, baseline);

			expect(comparison.relativeTo).toBe(1);
			expect(comparison.percentage).toBe(0);
		});
	});

	describe("sortByPerformance", () => {
		it("should sort results by average time (fastest first)", () => {
			const results: BenchResult[] = [
				createBenchResult("Slow", 30),
				createBenchResult("Fast", 10),
				createBenchResult("Medium", 20),
			];

			const sorted = sortByPerformance(results);

			expect(sorted[0].name).toBe("Fast");
			expect(sorted[1].name).toBe("Medium");
			expect(sorted[2].name).toBe("Slow");
		});

		it("should not mutate original array", () => {
			const results: BenchResult[] = [
				createBenchResult("B", 20),
				createBenchResult("A", 10),
			];

			const original = [...results];
			sortByPerformance(results);

			expect(results).toEqual(original);
		});

		it("should handle empty array", () => {
			const sorted = sortByPerformance([]);
			expect(sorted).toEqual([]);
		});

		it("should handle single result", () => {
			const results = [createBenchResult("Only", 10)];
			const sorted = sortByPerformance(results);
			expect(sorted).toHaveLength(1);
		});
	});

	describe("groupByPerformanceTier", () => {
		it("should group results into performance tiers", () => {
			const results: BenchResult[] = [
				createBenchResult("Very Fast", 10), // fast (baseline)
				createBenchResult("Fast", 12), // fast (< 1.5x)
				createBenchResult("Medium", 18), // medium (1.5x - 3x)
				createBenchResult("Slow", 35), // slow (> 3x)
			];

			const groups = groupByPerformanceTier(results);

			expect(groups.fast).toHaveLength(2);
			expect(groups.medium).toHaveLength(1);
			expect(groups.slow).toHaveLength(1);
		});

		it("should handle all results in fast tier", () => {
			const results: BenchResult[] = [
				createBenchResult("A", 10),
				createBenchResult("B", 11),
				createBenchResult("C", 12),
			];

			const groups = groupByPerformanceTier(results);

			expect(groups.fast).toHaveLength(3);
			expect(groups.medium).toHaveLength(0);
			expect(groups.slow).toHaveLength(0);
		});

		it("should return empty groups for empty array", () => {
			const groups = groupByPerformanceTier([]);

			expect(groups.fast).toEqual([]);
			expect(groups.medium).toEqual([]);
			expect(groups.slow).toEqual([]);
		});

		it("should use 1.5x and 3x thresholds correctly", () => {
			const results: BenchResult[] = [
				createBenchResult("Baseline", 10),
				createBenchResult("1.5x", 15), // exactly at threshold
				createBenchResult("3x", 30), // exactly at threshold
			];

			const groups = groupByPerformanceTier(results);

			// 1.5x should be in fast (<=), 3x should be in medium (<=)
			expect(groups.fast.map((r) => r.name)).toContain("1.5x");
			expect(groups.medium.map((r) => r.name)).toContain("3x");
		});
	});

	describe("calculateSpeedup", () => {
		it("should calculate speedup between two results", () => {
			const faster = createBenchResult("Fast", 10);
			const slower = createBenchResult("Slow", 30);

			const speedup = calculateSpeedup(faster, slower);
			expect(speedup).toBe(3);
		});

		it("should return 1 for equal performance", () => {
			const a = createBenchResult("A", 10);
			const b = createBenchResult("B", 10);

			const speedup = calculateSpeedup(a, b);
			expect(speedup).toBe(1);
		});

		it("should handle when 'faster' is actually slower", () => {
			const slower = createBenchResult("Slow", 30);
			const faster = createBenchResult("Fast", 10);

			const speedup = calculateSpeedup(slower, faster);
			expect(speedup).toBeCloseTo(0.333, 2);
		});
	});

	describe("integration tests", () => {
		it("should correctly analyze benchmark results", () => {
			const results: BenchResult[] = [
				createBenchResult("for loop", 10),
				createBenchResult("forEach", 15),
				createBenchResult("Array.map", 20),
				createBenchResult("reduce", 50),
			];

			const fastest = findFastest(results);
			const slowest = findSlowest(results);
			const sorted = sortByPerformance(results);
			const groups = groupByPerformanceTier(results);

			expect(fastest?.name).toBe("for loop");
			expect(slowest?.name).toBe("reduce");
			expect(sorted[0].name).toBe("for loop");
			expect(sorted[3].name).toBe("reduce");
			expect(groups.fast.length).toBeGreaterThan(0);
		});

		it("should calculate relative performance for all results", () => {
			const results: BenchResult[] = [
				createBenchResult("A", 10),
				createBenchResult("B", 20),
				createBenchResult("C", 30),
			];

			const baseline = results[0];
			const comparisons = results.map((r) => calculateRelativePerformance(r, baseline));

			expect(comparisons[0].relativeTo).toBe(1);
			expect(comparisons[1].relativeTo).toBe(2);
			expect(comparisons[2].relativeTo).toBe(3);
		});
	});
});
