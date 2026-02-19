import type { BenchResult } from "../types/index";
import {
	calculateRelativePerformance,
	calculateSpeedup,
	findFastest,
	findSlowest,
	sortByPerformance,
} from "../src/utils/comparison.utils";
import { createBenchResult } from "./usage.helpers";

// ============================================================================
// Example 1: Find Fastest and Slowest
// ============================================================================

console.log("=== Example 1: Find Fastest and Slowest ===");

const results: BenchResult[] = [
	createBenchResult("Array.forEach", 8.5),
	createBenchResult("for loop", 5.2),
	createBenchResult("Array.map", 9.8),
	createBenchResult("Array.reduce", 12.3),
];

const fastest = findFastest(results);
const slowest = findSlowest(results);

console.log(`Fastest: ${fastest?.name} (${fastest?.averageTime} ms)`);
console.log(`Slowest: ${slowest?.name} (${slowest?.averageTime} ms)`);

if (fastest && slowest) {
	const speedup = calculateSpeedup(fastest, slowest);
	console.log(`Fastest is ${speedup.toFixed(2)}x faster than slowest`);
}

// ============================================================================
// Example 2: Sort by Performance
// ============================================================================

console.log("\n=== Example 2: Sort by Performance ===");

const unsorted: BenchResult[] = [
	createBenchResult("Slow", 25.5),
	createBenchResult("Fast", 10.2),
	createBenchResult("Medium", 15.8),
	createBenchResult("Very Slow", 45.2),
];

const sorted = sortByPerformance(unsorted);

console.log("Sorted results (fastest to slowest):");
for (const [index, result] of sorted.entries()) {
	console.log(`  ${index + 1}. ${result.name}: ${result.averageTime} ms`);
}

// ============================================================================
// Example 3: Calculate Relative Performance
// ============================================================================

console.log("\n=== Example 3: Relative Performance ===");

const baseline = createBenchResult("Baseline", 10.0);
const candidates = [
	createBenchResult("Optimized v1", 8.5),
	createBenchResult("Optimized v2", 6.2),
	createBenchResult("Unoptimized", 15.3),
];

console.log(`Baseline: ${baseline.name} (${baseline.averageTime} ms)\n`);
console.log("Relative Performance:");

for (const candidate of candidates) {
	const comparison = calculateRelativePerformance(candidate, baseline);
	console.log(`\n${comparison.name}:`);
	console.log(`  Time: ${candidate.averageTime} ms`);
	console.log(`  Relative: ${comparison.relativeTo.toFixed(2)}x`);
	console.log(`  Percentage: ${comparison.percentage.toFixed(2)}%`);
	console.log(`  Ratio: ${comparison.ratio}`);
}
