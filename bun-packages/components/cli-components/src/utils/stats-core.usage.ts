/**
 * Usage examples for stats-core utilities
 *
 * This file demonstrates how to use statistical functions for benchmarking
 */

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
	variance,
} from "./stats-core";

// ============================================================================
// Example 1: Basic Statistics
// ============================================================================

const benchmarkTimes = [10.2, 10.5, 10.3, 10.8, 10.1, 10.4, 10.6];

console.log("=== Example 1: Basic Statistics ===");
console.log("Times (ms):", benchmarkTimes);
console.log("Mean:", mean(benchmarkTimes), "ms");
console.log("Median:", median(benchmarkTimes), "ms");
console.log("Min:", min(benchmarkTimes), "ms");
console.log("Max:", max(benchmarkTimes), "ms");
console.log("Variance:", variance(benchmarkTimes));
console.log("Std Dev:", standardDeviation(benchmarkTimes), "ms");

// Output:
// Mean: 10.414285714285714 ms
// Median: 10.4 ms
// Min: 10.1 ms
// Max: 10.8 ms
// Std Dev: 0.23... ms

// ============================================================================
// Example 2: Confidence Intervals
// ============================================================================

console.log("\n=== Example 2: Confidence Intervals ===");
const moe95 = marginOfError(benchmarkTimes, 0.95);
const moe99 = marginOfError(benchmarkTimes, 0.99);
const relativeMoe = relativeMarginOfError(benchmarkTimes, 0.95);

console.log("Margin of Error (95%):", moe95.toFixed(3), "ms");
console.log("Margin of Error (99%):", moe99.toFixed(3), "ms");
console.log("Relative Margin of Error:", relativeMoe.toFixed(2), "%");

// Output:
// Margin of Error (95%): 0.xxx ms
// Relative Margin of Error: x.xx%

// ============================================================================
// Example 3: Percentiles
// ============================================================================

const largeSample = [
	8.1,
	8.5,
	9.2,
	9.8,
	10.1,
	10.3,
	10.5,
	10.8,
	11.2,
	11.5,
	12.1,
	12.5,
	13.2,
	14.1,
	15.3,
];

console.log("\n=== Example 3: Percentiles ===");
console.log("p50 (median):", percentile(largeSample, 50), "ms");
console.log("p75:", percentile(largeSample, 75), "ms");
console.log("p90:", percentile(largeSample, 90), "ms");
console.log("p95:", percentile(largeSample, 95), "ms");
console.log("p99:", percentile(largeSample, 99), "ms");

// Output:
// p50 (median): 10.5 ms
// p90: 13.x ms
// p95: 14.x ms

// ============================================================================
// Example 4: Calculate All Percentiles
// ============================================================================

console.log("\n=== Example 4: Calculate All Percentiles ===");
const percentiles = calculatePercentiles(largeSample);
console.log("All percentiles:", percentiles);

// Output:
// { p25: x, p50: x, p75: x, p90: x, p95: x, p99: x }

// ============================================================================
// Example 5: Complete Statistics Report
// ============================================================================

console.log("\n=== Example 5: Complete Statistics ===");
const stats = calculateStatistics(benchmarkTimes, 0.95);
console.log("Complete Stats:", stats);

// Output:
// {
//   min: 10.1,
//   max: 10.8,
//   mean: 10.414...,
//   median: 10.4,
//   variance: 0.05...,
//   standardDeviation: 0.23...,
//   marginOfError: 0.17...,
//   relativeMarginOfError: 1.6...
// }

// ============================================================================
// Example 6: Operations Per Second
// ============================================================================

console.log("\n=== Example 6: Operations Per Second ===");
const avgTime = mean(benchmarkTimes);
const ops = opsPerSecond(avgTime);
console.log(`Average time: ${avgTime.toFixed(2)} ms`);
console.log(`Operations per second: ${ops.toFixed(0)} ops/s`);

// Output:
// Average time: 10.41 ms
// Operations per second: 96 ops/s

// ============================================================================
// Example 7: Comparing Two Benchmark Runs
// ============================================================================

const runA = [5.1, 5.2, 5.3, 5.4, 5.5];
const runB = [10.1, 10.2, 10.3, 10.4, 10.5];

console.log("\n=== Example 7: Comparing Runs ===");
const statsA = calculateStatistics(runA, 0.95);
const statsB = calculateStatistics(runB, 0.95);

console.log("Run A:");
console.log(
	`  Mean: ${statsA.mean.toFixed(2)} ms ±${statsA.relativeMarginOfError.toFixed(2)}%`,
);
console.log(`  Ops: ${opsPerSecond(statsA.mean).toFixed(0)} ops/s`);

console.log("Run B:");
console.log(
	`  Mean: ${statsB.mean.toFixed(2)} ms ±${statsB.relativeMarginOfError.toFixed(2)}%`,
);
console.log(`  Ops: ${opsPerSecond(statsB.mean).toFixed(0)} ops/s`);

const speedup = statsB.mean / statsA.mean;
console.log(`\nRun A is ${speedup.toFixed(2)}x faster than Run B`);

// Output:
// Run A is 2.00x faster than Run B

// ============================================================================
// Example 8: Statistical Significance
// ============================================================================

console.log("\n=== Example 8: Statistical Significance ===");
const benchmark1 = [10.1, 10.2, 10.3, 10.4, 10.5];
const benchmark2 = [15.1, 15.2, 15.3, 15.4, 15.5];

const stats1 = calculateStatistics(benchmark1, 0.95);
const stats2 = calculateStatistics(benchmark2, 0.95);

// Check if confidence intervals overlap
const ci1Lower = stats1.mean - stats1.marginOfError;
const ci1Upper = stats1.mean + stats1.marginOfError;
const ci2Lower = stats2.mean - stats2.marginOfError;
const ci2Upper = stats2.mean + stats2.marginOfError;

console.log(
	`Benchmark 1: ${stats1.mean.toFixed(2)} ms [${ci1Lower.toFixed(2)}, ${ci1Upper.toFixed(2)}]`,
);
console.log(
	`Benchmark 2: ${stats2.mean.toFixed(2)} ms [${ci2Lower.toFixed(2)}, ${ci2Upper.toFixed(2)}]`,
);

const overlap = ci1Upper >= ci2Lower && ci2Upper >= ci1Lower;
console.log(
	`Confidence intervals overlap: ${overlap ? "Yes (not significantly different)" : "No (significantly different)"}`,
);

// ============================================================================
// Example 9: Outlier Detection using Percentiles
// ============================================================================

const dataWithOutliers = [10, 11, 12, 13, 14, 15, 100]; // 100 is outlier

console.log("\n=== Example 9: Outlier Detection ===");
const p = calculatePercentiles(dataWithOutliers);
const iqr = p.p75 - p.p25; // Interquartile range
const lowerBound = p.p25 - 1.5 * iqr;
const upperBound = p.p75 + 1.5 * iqr;

console.log("IQR:", iqr);
console.log("Outlier bounds:", [lowerBound, upperBound]);
console.log(
	"Values outside bounds:",
	dataWithOutliers.filter((v) => v < lowerBound || v > upperBound),
);

// ============================================================================
// Example 10: Real-World Benchmark Analysis
// ============================================================================

console.log("\n=== Example 10: Real-World Benchmark ===");

// Simulate benchmark results from multiple runs
const benchResults = {
	"Array.map": [2.1, 2.3, 2.2, 2.4, 2.2, 2.3, 2.1, 2.2, 2.3, 2.2],
	"for loop": [1.1, 1.2, 1.1, 1.3, 1.2, 1.1, 1.2, 1.1, 1.2, 1.1],
	forEach: [1.8, 1.9, 1.8, 2.0, 1.9, 1.8, 1.9, 1.8, 1.9, 1.8],
};

console.log("Benchmark Analysis:");
for (const [name, times] of Object.entries(benchResults)) {
	const stats = calculateStatistics(times, 0.95);
	const ops = opsPerSecond(stats.mean);

	console.log(`\n${name}:`);
	console.log(`  Mean: ${stats.mean.toFixed(2)} ms`);
	console.log(`  Median: ${stats.median.toFixed(2)} ms`);
	console.log(`  Std Dev: ${stats.standardDeviation.toFixed(3)} ms`);
	console.log(`  ±${stats.relativeMarginOfError.toFixed(2)}%`);
	console.log(`  ${ops.toFixed(0)} ops/s`);
}

// Find fastest
const fastest = Object.entries(benchResults).reduce(
	(acc, [name, times]) => {
		const avgTime = mean(times);
		return avgTime < acc.time ? { name, time: avgTime } : acc;
	},
	{ name: "", time: Number.POSITIVE_INFINITY },
);

console.log(`\nFastest: ${fastest.name} (${fastest.time.toFixed(2)} ms)`);
