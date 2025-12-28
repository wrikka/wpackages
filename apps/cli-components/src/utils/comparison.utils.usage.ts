/**
 * Usage examples for comparison.utils
 *
 * Higher-level utilities for comparing benchmark results
 */

import type { BenchResult } from "../types/index";
import {
	calculateRelativePerformance,
	calculateSpeedup,
	findFastest,
	findSlowest,
	groupByPerformanceTier,
	sortByPerformance,
} from "./comparison.utils";

// Helper to create mock BenchResult for examples
const createBenchResult = (name: string, averageTime: number): BenchResult => ({
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

// Output:
// Fastest: for loop (5.2 ms)
// Slowest: Array.reduce (12.3 ms)
// Fastest is 2.37x faster than slowest

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

// Output:
// 1. Fast: 10.2 ms
// 2. Medium: 15.8 ms
// 3. Slow: 25.5 ms
// 4. Very Slow: 45.2 ms

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

// Output:
// Optimized v1:
//   Time: 8.5 ms
//   Relative: 0.85x
//   Percentage: -15.00%
//   Ratio: 0.85x

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

// ============================================================================
// Example 6: Framework Comparison
// ============================================================================

console.log("\n=== Example 6: Framework Comparison ===");

const frameworks: BenchResult[] = [
	createBenchResult("Vanilla JS", 5.2),
	createBenchResult("React", 12.8),
	createBenchResult("Vue", 11.5),
	createBenchResult("Angular", 15.3),
	createBenchResult("Svelte", 6.8),
];

const sortedFrameworks = sortByPerformance(frameworks);
const fastestFramework = findFastest(frameworks);
const tiers = groupByPerformanceTier(frameworks);

console.log("Framework Benchmark Results\n");

// Show rankings
console.log("Rankings:");
for (const [index, fw] of sortedFrameworks.entries()) {
	const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "  ";
	console.log(`${medal} ${fw.name}: ${fw.averageTime} ms`);
}

// Show comparison
if (fastestFramework) {
	console.log("\nComparison vs Fastest:");
	for (const fw of sortedFrameworks.slice(1)) {
		const comp = calculateRelativePerformance(fw, fastestFramework);
		console.log(
			`  ${fw.name}: ${comp.ratio} (${comp.percentage > 0 ? "+" : ""}${comp.percentage.toFixed(1)}%)`,
		);
	}
}

// Show tiers
console.log("\nPerformance Categories:");
console.log(`  Excellent: ${tiers.fast.map((r) => r.name).join(", ")}`);
console.log(`  Good: ${tiers.medium.map((r) => r.name).join(", ")}`);
console.log(`  Needs Work: ${tiers.slow.map((r) => r.name).join(", ")}`);

// ============================================================================
// Example 7: Database Query Performance
// ============================================================================

console.log("\n=== Example 7: Database Query Analysis ===");

const queries: BenchResult[] = [
	createBenchResult("SELECT with index", 2.5),
	createBenchResult("SELECT without index", 45.8),
	createBenchResult("JOIN optimized", 8.2),
	createBenchResult("JOIN unoptimized", 125.3),
	createBenchResult("Aggregate query", 15.5),
];

const sortedQueries = sortByPerformance(queries);
const fastestQuery = findFastest(queries);
const slowestQuery = findSlowest(queries);

console.log("Database Query Performance\n");

if (fastestQuery && slowestQuery) {
	const extremeSpeedup = calculateSpeedup(fastestQuery, slowestQuery);
	console.log(`Performance spread: ${extremeSpeedup.toFixed(1)}x\n`);
}

console.log("Query Performance:");
for (const query of sortedQueries) {
	let status = "✅";
	if (query.averageTime > 50) status = "🔴";
	else if (query.averageTime > 20) status = "🟡";

	console.log(`${status} ${query.name}: ${query.averageTime} ms`);
}

// Recommendations
console.log("\n💡 Recommendations:");
const slowQueries = sortedQueries.filter((q) => q.averageTime > 20);
for (const query of slowQueries) {
	if (fastestQuery) {
		const improvement = calculateRelativePerformance(query, fastestQuery);
		console.log(
			`   - Optimize "${query.name}" (${improvement.percentage.toFixed(0)}% slower)`,
		);
	}
}

// ============================================================================
// Example 8: API Endpoint Benchmarking
// ============================================================================

console.log("\n=== Example 8: API Endpoint Performance ===");

const endpoints: BenchResult[] = [
	createBenchResult("GET /users (cached)", 5.2),
	createBenchResult("GET /users (uncached)", 85.5),
	createBenchResult("POST /users", 125.8),
	createBenchResult("GET /search", 45.2),
	createBenchResult("GET /dashboard", 195.3),
];

const sortedEndpoints = sortByPerformance(endpoints);
const endpointTiers = groupByPerformanceTier(endpoints);

console.log("API Performance Report\n");
console.log("Status by Endpoint:");

for (const endpoint of sortedEndpoints) {
	let icon: string;
	let status: string;

	if (endpoint.averageTime < 50) {
		icon = "🟢";
		status = "EXCELLENT";
	} else if (endpoint.averageTime < 100) {
		icon = "🟡";
		status = "ACCEPTABLE";
	} else {
		icon = "🔴";
		status = "NEEDS ATTENTION";
	}

	console.log(`${icon} ${endpoint.name}`);
	console.log(`   Time: ${endpoint.averageTime} ms - ${status}`);
}

console.log("\nPerformance Tiers:");
console.log(`  Fast Endpoints: ${endpointTiers.fast.length}`);
console.log(`  Medium Endpoints: ${endpointTiers.medium.length}`);
console.log(`  Slow Endpoints: ${endpointTiers.slow.length}`);

// Cache impact analysis
const cachedEndpoint = endpoints.find((e) => e.name.includes("cached"));
const uncachedEndpoint = endpoints.find((e) => e.name.includes("uncached"));

if (cachedEndpoint && uncachedEndpoint) {
	const cacheSpeedup = calculateSpeedup(cachedEndpoint, uncachedEndpoint);
	console.log(`\n💰 Cache Impact: ${cacheSpeedup.toFixed(1)}x speedup`);
}

// ============================================================================
// Example 9: Build Tool Comparison
// ============================================================================

console.log("\n=== Example 9: Build Tool Benchmarks ===");

const buildTools: BenchResult[] = [
	createBenchResult("esbuild", 1.2),
	createBenchResult("tsdown", 1.5),
	createBenchResult("Vite", 2.8),
	createBenchResult("Rollup", 8.5),
	createBenchResult("Webpack", 15.2),
];

const sortedBuildTools = sortByPerformance(buildTools);
const fastestBuilder = findFastest(buildTools);

console.log("Build Tool Performance (production build)\n");

if (fastestBuilder) {
	console.log(
		`🏆 Winner: ${fastestBuilder.name} (${fastestBuilder.averageTime}s)\n`,
	);

	console.log("All Tools:");
	for (const tool of sortedBuildTools) {
		const comparison = calculateRelativePerformance(tool, fastestBuilder);
		const bar = "█".repeat(Math.min(50, Math.round(tool.averageTime * 3)));

		console.log(`${tool.name.padEnd(12)} ${bar}`);
		console.log(`${"".padEnd(12)} ${tool.averageTime}s (${comparison.ratio})`);
	}
}

// ============================================================================
// Example 10: Complete Workflow Example
// ============================================================================

console.log("\n=== Example 10: Complete Workflow ===");

// Simulate running multiple benchmarks
const workflowResults: BenchResult[] = [
	createBenchResult("Implementation A", 25.5),
	createBenchResult("Implementation B", 18.2),
	createBenchResult("Implementation C", 32.8),
	createBenchResult("Implementation D", 15.5),
	createBenchResult("Implementation E", 28.1),
];

console.log("Complete Benchmark Workflow\n");

// Step 1: Find extremes
const best = findFastest(workflowResults);
const worst = findSlowest(workflowResults);

console.log("1️⃣  Identifying Extremes:");
console.log(`   Best: ${best?.name} (${best?.averageTime} ms)`);
console.log(`   Worst: ${worst?.name} (${worst?.averageTime} ms)`);

// Step 2: Sort results
const ordered = sortByPerformance(workflowResults);
console.log("\n2️⃣  Ranked Results:");
for (const [i, r] of ordered.entries()) {
	console.log(`   ${i + 1}. ${r.name}: ${r.averageTime} ms`);
}

// Step 3: Group by tier
const categories = groupByPerformanceTier(workflowResults);
console.log("\n3️⃣  Performance Categories:");
console.log(`   Fast: ${categories.fast.length} implementations`);
console.log(`   Medium: ${categories.medium.length} implementations`);
console.log(`   Slow: ${categories.slow.length} implementations`);

// Step 4: Detailed comparison
if (best) {
	console.log("\n4️⃣  Detailed Comparison vs Best:");
	for (const result of ordered.slice(1)) {
		const comp = calculateRelativePerformance(result, best);
		console.log(`   ${result.name}:`);
		console.log(
			`     ${comp.ratio} | ${comp.percentage > 0 ? "+" : ""}${comp.percentage.toFixed(1)}%`,
		);
	}
}

// Step 5: Recommendations
console.log("\n5️⃣  Recommendations:");
console.log(`   ✅ Use: ${best?.name}`);
console.log(`   ⚠️  Avoid: ${worst?.name}`);
if (categories.fast.length > 1) {
	console.log(
		`   🎯 Also good: ${
			categories.fast
				.slice(1)
				.map((r) => r.name)
				.join(", ")
		}`,
	);
}
