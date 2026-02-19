import type { BenchmarkResult, ComparisonResult } from "../types/index";
import { calculatePercentiles, max, mean, median, min, standardDeviation, variance } from "../utils/stats-core";

/**
 * Calculate statistics from benchmark timing data
 *
 * @param command - The command that was benchmarked
 * @param times - Array of execution times in milliseconds
 * @returns Benchmark result with calculated statistics
 *
 * @example
 * ```ts
 * const times = [100, 102, 98, 101, 99];
 * const result = calculateStats("npm run test", times);
 * console.log(`Mean: ${result.mean}ms`);
 * ```
 */
export const calculateStats = (
	command: string,
	times: number[],
): BenchmarkResult => {
	return {
		command,
		max: max(times),
		mean: mean(times),
		median: median(times),
		min: min(times),
		percentiles: calculatePercentiles(times),
		runs: times.length,
		stddev: standardDeviation(times),
		times,
		variance: variance(times),
	};
};

/**
 * Compare multiple benchmark results and calculate relative performance
 *
 * @param results - Array of benchmark results to compare
 * @returns Comparison result with speedup factors
 * @throws If no results provided or unable to determine fastest/slowest
 *
 * @example
 * ```ts
 * const results = [result1, result2, result3];
 * const comparison = compareResults(results);
 * console.log(`Fastest: ${comparison.fastest}`);
 * console.log(`Speedups:`, comparison.speedups);
 * ```
 */
export const compareResults = (
	results: BenchmarkResult[],
): ComparisonResult => {
	const sortedByMean = [...results].sort((a, b) => a.mean - b.mean);
	const fastest = sortedByMean[0];
	const slowest = sortedByMean[sortedByMean.length - 1];

	if (!fastest || !slowest) {
		throw new Error("No results to compare");
	}

	const speedups: Record<string, number> = {};
	for (const result of results) {
		speedups[result.command] = result.mean / fastest.mean;
	}

	return {
		fastest: fastest.command,
		results,
		slowest: slowest.command,
		speedups,
	};
};
