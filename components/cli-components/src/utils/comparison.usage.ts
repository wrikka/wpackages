/**
 * Usage examples for comparison utilities
 *
 * This file demonstrates how to use comparison functions for benchmarking
 */

import { calculateRelativePerformance, calculateSpeedup, formatRatio, percentageDifference } from "./comparison.utils";

interface BenchResult {
	name: string;
	averageTime: number;
	ops: number;
	stats: any;
	iterations: number;
	samples: number;
	totalTime: number;
	timestamps: number[];
}

// ============================================================================
// Example 1: Calculate Speedup
// ============================================================================

console.log("=== Example 1: Calculate Speedup ===");

const oldResult: BenchResult = {
	name: "old",
	averageTime: 100,
	ops: 10,
	stats: {} as any,
	iterations: 1,
	samples: 1,
	totalTime: 100,
	timestamps: [],
};
const newResult: BenchResult = {
	name: "new",
	averageTime: 50,
	ops: 20,
	stats: {} as any,
	iterations: 1,
	samples: 1,
	totalTime: 50,
	timestamps: [],
};

const speedup = calculateSpeedup(newResult, oldResult);
console.log(`Old implementation: ${oldResult.averageTime} ms`);
console.log(`New implementation: ${newResult.averageTime} ms`);
console.log(`Speedup: ${speedup}x`);
console.log(`New is ${speedup}x faster than old`);

// Output:
// Speedup: 2x
// New is 2x faster than old

// ============================================================================
// Example 2: Relative Performance
// ============================================================================

console.log("\n=== Example 2: Relative Performance ===");

const baselineResult: BenchResult = {
	name: "baseline",
	averageTime: 10,
	ops: 100,
	stats: {} as any,
	iterations: 1,
	samples: 1,
	totalTime: 10,
	timestamps: [],
};
const currentResult: BenchResult = {
	name: "current",
	averageTime: 15,
	ops: 66,
	stats: {} as any,
	iterations: 1,
	samples: 1,
	totalTime: 15,
	timestamps: [],
};

const relative = calculateRelativePerformance(currentResult, baselineResult);
console.log(`Baseline: ${baselineResult.averageTime} ms`);
console.log(`Current: ${currentResult.averageTime} ms`);
console.log(`Relative performance: ${relative.ratio}`);

if (relative.relativeTo > 1) {
	console.log(`Current is ${relative.ratio} slower than baseline`);
} else if (relative.relativeTo < 1) {
	console.log(`Current is ${1 / relative.relativeTo}x faster than baseline`);
} else {
	console.log("Same performance");
}

// Output:
// Relative performance: 1.5x
// Current is 1.5x slower than baseline

// ============================================================================
// Example 3: Format Ratio
// ============================================================================

console.log("\n=== Example 3: Format Ratio ===");

const ratios = [0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 4.0];

console.log("Ratio formatting:");
for (const ratio of ratios) {
	const formatted = formatRatio(ratio);
	console.log(`  ${ratio}x => ${formatted}`);
}

// Output:
// 0.25x => 4.00x faster
// 0.5x => 2.00x faster
// 1.0x => same speed
// 1.5x => 1.50x slower
// 2.0x => 2.00x slower

// ============================================================================
// Example 4: Percentage Difference
// ============================================================================

console.log("\n=== Example 4: Percentage Difference ===");

const versionBenchmarks = [
	{ name: "v1.0", time: 100 },
	{ name: "v2.0", time: 80 },
	{ name: "v3.0", time: 120 },
	{ name: "v4.0", time: 100 },
];

const firstBenchmark = versionBenchmarks[0];
if (firstBenchmark) {
	console.log(`Baseline: ${firstBenchmark.name} (${firstBenchmark.time} ms)`);
	console.log("\nComparison vs baseline:");
	for (const bench of versionBenchmarks.slice(1)) {
		const diff = percentageDifference(bench.time, firstBenchmark.time);
		console.log(`  ${bench.name}: ${bench.time} ms (${diff})`);
	}
}

// Output:
// v2.0: 80 ms (-20.00%)
// v3.0: 120 ms (+20.00%)
// v4.0: 100 ms (+0.00%)

// ============================================================================
// Example 5: Comparing Multiple Implementations
// ============================================================================

console.log("\n=== Example 5: Compare Multiple Implementations ===");

const implementations = {
	"Native for loop": 5.2,
	"Array.forEach": 8.1,
	"Array.map": 9.5,
	"Array.reduce": 12.3,
};

const fastestTime = Math.min(...Object.values(implementations));
const fastestName = Object.entries(implementations).find(
	([_, time]) => time === fastestTime,
)?.[0];

console.log(`Fastest: ${fastestName} (${fastestTime} ms)\n`);
console.log("Comparison:");

for (const [name, time] of Object.entries(implementations)) {
	const ratio = formatRatio(time / fastestTime);
	const percentage = percentageDifference(time, fastestTime);

	console.log(`${name}:`);
	console.log(`  Time: ${time} ms`);
	console.log(`  vs Fastest: ${ratio}`);
	console.log(`  Difference: ${percentage}`);
	console.log();
}

// Output:
// Native for loop:
//   Time: 5.2 ms
//   vs Fastest: same speed
//   Difference: +0.00%
//
// Array.forEach:
//   Time: 8.1 ms
//   vs Fastest: 1.56x slower
//   Difference: +55.77%

// ============================================================================
// Example 6: Performance Regression Detection
// ============================================================================

console.log("\n=== Example 6: Performance Regression ===");

const previousBuild = 45.2; // ms
const currentBuild = 52.8; // ms
const threshold = 0.1; // 10% regression threshold

const currentBuildResult: BenchResult = {
	name: "current",
	averageTime: currentBuild,
	ops: 1,
	stats: {} as any,
	iterations: 1,
	samples: 1,
	totalTime: 1,
	timestamps: [],
};
const previousBuildResult: BenchResult = {
	name: "previous",
	averageTime: previousBuild,
	ops: 1,
	stats: {} as any,
	iterations: 1,
	samples: 1,
	totalTime: 1,
	timestamps: [],
};
const regression = calculateRelativePerformance(currentBuildResult, previousBuildResult);
const percentChange = percentageDifference(currentBuild, previousBuild);

console.log(`Previous: ${previousBuild} ms`);
console.log(`Current: ${currentBuild} ms`);
console.log(`Change: ${percentChange}`);

const regressionPercent = (regression.relativeTo - 1) * 100;
if (regressionPercent > threshold * 100) {
	console.log("⚠️  WARNING: Performance regression detected!");
	console.log(`   Regression: ${regressionPercent.toFixed(2)}%`);
} else {
	console.log("✅ Performance is acceptable");
}

// Output:
// ⚠️  WARNING: Performance regression detected!
//    Regression: 16.81%

// ============================================================================
// Example 7: A/B Test Comparison
// ============================================================================

console.log("\n=== Example 7: A/B Test ===");

const variantA = 125.5; // ms
const variantB = 98.2; // ms

const variantAResult: BenchResult = {
	name: "A",
	averageTime: variantA,
	ops: 1,
	stats: {} as any,
	iterations: 1,
	samples: 1,
	totalTime: 1,
	timestamps: [],
};
const variantBResult: BenchResult = {
	name: "B",
	averageTime: variantB,
	ops: 1,
	stats: {} as any,
	iterations: 1,
	samples: 1,
	totalTime: 1,
	timestamps: [],
};
const speedupB = calculateSpeedup(variantBResult, variantAResult);
const ratioB = formatRatio(variantB / variantA);
const improvementB = percentageDifference(variantB, variantA);

console.log("A/B Test Results:");
console.log(`Variant A: ${variantA} ms`);
console.log(`Variant B: ${variantB} ms`);
console.log(`\nVariant B is ${speedupB.toFixed(2)}x faster`);
console.log(`Performance: ${ratioB}`);
console.log(`Improvement: ${improvementB}`);

if (speedupB > 1.2) {
	console.log("\n✅ Variant B shows significant improvement!");
	console.log("   Recommendation: Deploy Variant B");
} else {
	console.log("\n⚠️  Improvement is marginal");
	console.log("   Recommendation: More testing needed");
}

// ============================================================================
// Example 8: Benchmark Comparison Table
// ============================================================================

console.log("\n=== Example 8: Comparison Table ===");

interface BenchmarkResult {
	name: string;
	time: number;
}

const results: BenchmarkResult[] = [
	{ name: "QuickSort", time: 12.5 },
	{ name: "MergeSort", time: 15.2 },
	{ name: "HeapSort", time: 18.7 },
	{ name: "BubbleSort", time: 245.3 },
];

const fastest = results.reduce((min, r) => (r.time < min.time ? r : min));

console.log("Sorting Algorithm Benchmark\n");
console.log("Algorithm       | Time (ms) | vs Fastest | Difference");
console.log("----------------|-----------|------------|------------");

for (const result of results) {
	const ratio = formatRatio(result.time / fastest.time);
	const diff = percentageDifference(result.time, fastest.time);
	const timeStr = result.time.toFixed(1).padEnd(8);
	const nameStr = result.name.padEnd(14);

	console.log(`${nameStr} | ${timeStr} | ${ratio.padEnd(10)} | ${diff}`);
}

// ============================================================================
// Example 9: CI/CD Performance Monitoring
// ============================================================================

console.log("\n=== Example 9: CI/CD Monitoring ===");

const builds = [
	{ commit: "abc123", time: 45.2 },
	{ commit: "def456", time: 46.1 },
	{ commit: "ghi789", time: 44.8 },
	{ commit: "jkl012", time: 52.3 }, // regression
];

console.log("Build Performance History:\n");

for (let i = 1; i < builds.length; i++) {
	const current = builds[i];
	const previous = builds[i - 1];

	if (current && previous) {
		const diff = percentageDifference(current.time, previous.time);
		const status = current.time > previous.time ? "⚠️ " : "✅";

		console.log(`${current.commit}: ${current.time} ms ${status}`);
		console.log(`  vs ${previous.commit}: ${diff}`);
	}
}

// ============================================================================
// Example 10: Real-world Optimization Tracking
// ============================================================================

console.log("\n=== Example 10: Optimization Tracking ===");

const optimizationStages = [
	{ stage: "Baseline (unoptimized)", time: 150.0 },
	{ stage: "Add caching", time: 95.5 },
	{ stage: "Algorithm improvement", time: 62.3 },
	{ stage: "Parallel processing", time: 28.7 },
];

console.log("Optimization Progress:\n");

const optimizationBaseline = optimizationStages[0];
if (optimizationBaseline) {
	for (const [index, stage] of optimizationStages.entries()) {
		const speedupVsBaseline = calculateSpeedup(
			{
				name: stage.stage,
				...stage,
				averageTime: stage.time,
				ops: 1,
				stats: {} as any,
				iterations: 1,
				samples: 1,
				totalTime: 1,
				timestamps: [],
			},
			{
				name: optimizationBaseline.stage,
				...optimizationBaseline,
				averageTime: optimizationBaseline.time,
				ops: 1,
				stats: {} as any,
				iterations: 1,
				samples: 1,
				totalTime: 1,
				timestamps: [],
			},
		);
		const ratioVsBaseline = formatRatio(stage.time / optimizationBaseline.time);
		const improvement = percentageDifference(
			stage.time,
			optimizationBaseline.time,
		);

		console.log(`${index + 1}. ${stage.stage}`);
		console.log(`   Time: ${stage.time} ms`);

		if (index > 0) {
			const previous = optimizationStages[index - 1];
			if (previous) {
				const stepImprovement = percentageDifference(stage.time, previous.time);
				console.log(`   Step improvement: ${stepImprovement}`);
			}
		}

		console.log(`   vs Baseline: ${ratioVsBaseline} (${improvement})`);
		console.log(`   Total speedup: ${speedupVsBaseline.toFixed(2)}x`);
		console.log();
	}
}

const lastStage = optimizationStages[optimizationStages.length - 1];
const firstStage = optimizationStages[0];

if (lastStage && firstStage) {
	const totalSpeedup = calculateSpeedup(
		{
			name: lastStage.stage,
			...lastStage,
			averageTime: lastStage.time,
			ops: 1,
			stats: {} as any,
			iterations: 1,
			samples: 1,
			totalTime: 1,
			timestamps: [],
		},
		{
			name: firstStage.stage,
			...firstStage,
			averageTime: firstStage.time,
			ops: 1,
			stats: {} as any,
			iterations: 1,
			samples: 1,
			totalTime: 1,
			timestamps: [],
		},
	);
	console.log(`🚀 Total optimization: ${totalSpeedup.toFixed(2)}x faster!`);
}
