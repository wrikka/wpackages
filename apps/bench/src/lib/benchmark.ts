import type { BenchmarkResult, ComparisonResult } from "../types/index";
import {
	calculatePercentiles,
	max,
	mean,
	median,
	min,
	standardDeviation,
	variance,
	welchTTest,
} from "../utils/stats-core";

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
	errorCount = 0,
	totalRequestedRuns = times.length,
	resource: {
		readonly cpuUserMicros: number;
		readonly cpuSystemMicros: number;
		readonly maxRssBytes: number;
		readonly fsReadBytes: number;
		readonly fsWriteBytes: number;
	} = {
		cpuUserMicros: 0,
		cpuSystemMicros: 0,
		maxRssBytes: 0,
		fsReadBytes: 0,
		fsWriteBytes: 0,
	},
): BenchmarkResult => {
	const totalTimeMs = times.reduce((acc, t) => acc + t, 0);
	const throughputOpsPerSec = totalTimeMs > 0 ? times.length / (totalTimeMs / 1000) : 0;
	const totalRuns = totalRequestedRuns;
	const errorRate = totalRuns > 0 ? errorCount / totalRuns : 0;

	return {
		command,
		max: max(times),
		mean: mean(times),
		median: median(times),
		min: min(times),
		percentiles: calculatePercentiles(times),
		runs: totalRuns,
		stddev: standardDeviation(times),
		times,
		totalTimeMs,
		variance: variance(times),
		throughputOpsPerSec,
		errorCount,
		errorRate,
		cpuUserMs: resource.cpuUserMicros / 1000,
		cpuSystemMs: resource.cpuSystemMicros / 1000,
		maxRssBytes: resource.maxRssBytes,
		fsReadBytes: resource.fsReadBytes,
		fsWriteBytes: resource.fsWriteBytes,
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
		throw new Error("Cannot compare results: at least one benchmark result is required.");
	}

	const speedups: Record<string, number> = {};
	const pValues: Record<string, number> = {};

	for (const result of results) {
		speedups[result.command] = result.mean / fastest.mean;

		if (result.command !== fastest.command) {
			const testResult = welchTTest(fastest.times, result.times);
			if (testResult) {
				pValues[result.command] = testResult.p;
			}
		}
	}

	return {
		fastest: fastest.command,
		results,
		slowest: slowest.command,
		speedups,
		pValues,
	};
};
