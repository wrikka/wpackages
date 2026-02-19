import type { BenchResult } from "../types/index";
import {
	calculateRelativePerformance,
	calculateSpeedup,
	findFastest,
	findSlowest,
	groupByPerformanceTier,
	sortByPerformance,
} from "../src/utils/comparison.utils";
import { createBenchResult } from "./usage.helpers";

// ============================================================================
// Example 4: Group by Performance Tier
// ============================================================================

console.log("\n=== Example 4: Group by Performance Tier ===");

const benchmarks: BenchResult[] = [
	createBenchResult("Super Fast", 5.0),
	createBenchResult("Fast", 7.5),
	createBenchResult("Decent", 10.5),
	createBenchResult("Medium", 18.0),
	createBenchResult("Slow", 28.5),
	createBenchResult("Very Slow", 45.0),
];

const groups = groupByPerformanceTier(benchmarks);

console.log("Performance Tiers:\n");
console.log("🟢 Fast (< 1.5x baseline):");
for (const result of groups.fast) {
	console.log(`   - ${result.name}: ${result.averageTime} ms`);
}

console.log("\n🟡 Medium (1.5x - 3x baseline):");
for (const result of groups.medium) {
	console.log(`   - ${result.name}: ${result.averageTime} ms`);
}

console.log("\n🔴 Slow (> 3x baseline):");
for (const result of groups.slow) {
	console.log(`   - ${result.name}: ${result.averageTime} ms`);
}

// ============================================================================
// Example 5: Comprehensive Benchmark Analysis
// ============================================================================

console.log("\n=== Example 5: Comprehensive Analysis ===");

const testResults: BenchResult[] = [
	createBenchResult("QuickSort", 12.5),
	createBenchResult("MergeSort", 15.8),
	createBenchResult("HeapSort", 18.2),
	createBenchResult("BubbleSort", 245.5),
];

const fastestResult = findFastest(testResults);
const slowestResult = findSlowest(testResults);
const sortedResults = sortByPerformance(testResults);

console.log("Benchmark Analysis Report\n");
console.log("=".repeat(50));

if (fastestResult) {
	console.log(`\n✅ Fastest: ${fastestResult.name}`);
	console.log(`   Time: ${fastestResult.averageTime} ms`);
	console.log(`   Ops/s: ${fastestResult.ops.toFixed(0)}`);
}

if (slowestResult) {
	console.log(`\n❌ Slowest: ${slowestResult.name}`);
	console.log(`   Time: ${slowestResult.averageTime} ms`);
	console.log(`   Ops/s: ${slowestResult.ops.toFixed(0)}`);
}

if (fastestResult && slowestResult) {
	const range = calculateSpeedup(fastestResult, slowestResult);
	console.log(`\n📊 Performance Range: ${range.toFixed(2)}x`);
}

console.log("\n📋 Ranking:");
for (const [index, result] of sortedResults.entries()) {
	console.log(`   ${index + 1}. ${result.name} - ${result.averageTime} ms`);
}

console.log("\n🎯 Detailed Comparison vs Fastest:");
if (fastestResult) {
	for (const result of sortedResults.slice(1)) {
		const comparison = calculateRelativePerformance(result, fastestResult);
		console.log(
			`   ${result.name}: ${comparison.ratio} slower (+${comparison.percentage.toFixed(1)}%)`,
		);
	}
}
