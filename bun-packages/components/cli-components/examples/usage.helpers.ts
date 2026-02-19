import type { BenchResult } from "../types/index";

// Helper to create mock BenchResult for examples
export const createBenchResult = (name: string, averageTime: number): BenchResult => ({
	name,
	iterations: 1000,
	samples: 10,
	totalTime: averageTime * 1000,
	averageTime,
	ops: 1000 / averageTime,
	stats: {
		min: averageTime * 0.9,
		max: averageTime * 1.1,
		mean: averageTime,
		median: averageTime,
		variance: 0.1,
		standardDeviation: 0.3,
		marginOfError: 0.05,
		relativeMarginOfError: 1.0,
	},
	timestamps: Array.from({ length: 10 }, () => averageTime),
});
