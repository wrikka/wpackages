import { describe, expect, it } from "vitest";
import { calculateRelativePerformance, calculateSpeedup, formatRatio, percentageDifference } from "./comparison.utils";
import type { BenchResult } from "../types/index";

const createBenchResult = (name: string, averageTime: number): BenchResult => ({
	name,
	iterations: 100,
	samples: 10,
	totalTime: averageTime * 100,
	averageTime,
	ops: 1000 / averageTime,
	stats: {
		min: averageTime * 0.9,
		max: averageTime * 1.1,
		mean: averageTime,
		median: averageTime,
		variance: 0.1,
		standardDeviation: 0.3,
		marginOfError: 0.5,
		relativeMarginOfError: 0.1,
	},
	timestamps: [],
});

describe("comparison", () => {
	describe("calculateSpeedup", () => {
		it("should calculate speedup when slower is 2x slower", () => {
			const faster = createBenchResult("fast", 10);
			const slower = createBenchResult("slow", 20);
			expect(calculateSpeedup(faster, slower)).toBe(2);
		});

		it("should calculate speedup when slower is 3x slower", () => {
			const faster = createBenchResult("fast", 10);
			const slower = createBenchResult("slow", 30);
			expect(calculateSpeedup(faster, slower)).toBe(3);
		});

		it("should return 1 when times are equal", () => {
			const fast = createBenchResult("fast", 10);
			const slow = createBenchResult("slow", 10);
			expect(calculateSpeedup(fast, slow)).toBe(1);
		});

		it("should handle decimal speedup", () => {
			const faster = createBenchResult("fast", 10);
			const slower = createBenchResult("slow", 15);
			expect(calculateSpeedup(faster, slower)).toBe(1.5);
		});

		it("should handle very fast operations", () => {
			const faster = createBenchResult("fast", 0.001);
			const slower = createBenchResult("slow", 0.01);
			expect(calculateSpeedup(faster, slower)).toBe(10);
		});

		it("should handle when slower is actually faster", () => {
			const faster = createBenchResult("fast", 20);
			const slower = createBenchResult("slow", 10);
			expect(calculateSpeedup(faster, slower)).toBe(0.5);
		});
	});

	describe("calculateRelativePerformance", () => {
		it("should return 1 when times are equal", () => {
			const result = createBenchResult("test", 10);
			const baseline = createBenchResult("baseline", 10);
			expect(calculateRelativePerformance(result, baseline).relativeTo).toBe(1);
		});

		it("should return 2 when time is 2x slower", () => {
			const result = createBenchResult("test", 20);
			const baseline = createBenchResult("baseline", 10);
			expect(calculateRelativePerformance(result, baseline).relativeTo).toBe(2);
		});

		it("should return 0.5 when time is 2x faster", () => {
			const result = createBenchResult("test", 10);
			const baseline = createBenchResult("baseline", 20);
			expect(calculateRelativePerformance(result, baseline).relativeTo).toBe(0.5);
		});

		it("should handle decimal relative performance", () => {
			const result = createBenchResult("test", 15);
			const baseline = createBenchResult("baseline", 10);
			expect(calculateRelativePerformance(result, baseline).relativeTo).toBe(1.5);
		});

		it("should handle very small times", () => {
			const result = createBenchResult("test", 0.002);
			const baseline = createBenchResult("baseline", 0.001);
			expect(calculateRelativePerformance(result, baseline).relativeTo).toBe(2);
		});
	});

	describe("formatRatio", () => {
		it("should format when faster (< 1)", () => {
			expect(formatRatio(0.5)).toBe("2.00x faster");
		});

		it("should format when much faster", () => {
			expect(formatRatio(0.25)).toBe("4.00x faster");
		});

		it("should format when same speed", () => {
			expect(formatRatio(1)).toBe("same speed");
		});

		it("should format when slower (> 1)", () => {
			expect(formatRatio(2)).toBe("2.00x slower");
		});

		it("should format when much slower", () => {
			expect(formatRatio(5)).toBe("5.00x slower");
		});

		it("should format decimal ratios", () => {
			expect(formatRatio(1.5)).toBe("1.50x slower");
		});

		it("should format small speedup", () => {
			expect(formatRatio(0.9)).toContain("faster");
		});

		it("should format large speedup", () => {
			expect(formatRatio(0.1)).toBe("10.00x faster");
		});
	});

	describe("percentageDifference", () => {
		it("should calculate positive percentage difference", () => {
			const result = percentageDifference(120, 100);
			expect(result).toBe("+20.00%");
		});

		it("should calculate negative percentage difference", () => {
			const result = percentageDifference(80, 100);
			expect(result).toBe("-20.00%");
		});

		it("should return +0.00% when values are equal", () => {
			const result = percentageDifference(100, 100);
			expect(result).toBe("+0.00%");
		});

		it("should return N/A when baseline is 0", () => {
			const result = percentageDifference(100, 0);
			expect(result).toBe("N/A");
		});

		it("should handle small differences", () => {
			const result = percentageDifference(101, 100);
			expect(result).toBe("+1.00%");
		});

		it("should handle large differences", () => {
			const result = percentageDifference(200, 100);
			expect(result).toBe("+100.00%");
		});

		it("should handle decimal values", () => {
			const result = percentageDifference(10.5, 10);
			expect(result).toBe("+5.00%");
		});

		it("should format negative with sign", () => {
			const result = percentageDifference(50, 100);
			expect(result).toContain("-");
		});

		it("should format positive with + sign", () => {
			const result = percentageDifference(150, 100);
			expect(result).toContain("+");
		});
	});

	describe("integration tests", () => {
		it("should calculate speedup and format ratio correctly", () => {
			const fasterTime = 10;
			const slowerTime = 30;
			const speedup = calculateSpeedup(fasterTime, slowerTime);
			const ratio = formatRatio(slowerTime / fasterTime);

			expect(speedup).toBe(3);
			expect(ratio).toBe("3.00x slower");
		});

		it("should calculate relative performance and percentage difference", () => {
			const time = 150;
			const baseline = 100;
			const relative = calculateRelativePerformance(time, baseline);
			const percentage = percentageDifference(time, baseline);

			expect(relative).toBe(1.5);
			expect(percentage).toBe("+50.00%");
		});

		it("should handle comparison where newer is faster", () => {
			const oldTime = 100;
			const newTime = 50;
			const speedup = calculateSpeedup(newTime, oldTime);
			const ratio = formatRatio(newTime / oldTime);
			const percentage = percentageDifference(newTime, oldTime);

			expect(speedup).toBe(2);
			expect(ratio).toBe("2.00x faster");
			expect(percentage).toBe("-50.00%");
		});

		it("should handle comparison where newer is slower", () => {
			const oldTime = 50;
			const newTime = 100;
			const speedup = calculateSpeedup(oldTime, newTime);
			const ratio = formatRatio(newTime / oldTime);
			const percentage = percentageDifference(newTime, oldTime);

			expect(speedup).toBe(2);
			expect(ratio).toBe("2.00x slower");
			expect(percentage).toBe("+100.00%");
		});
	});
});
