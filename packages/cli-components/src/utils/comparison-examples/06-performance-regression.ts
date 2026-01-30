/**
 * Example 6: Performance Regression Detection
 */
import { calculateRelativePerformance, percentageDifference } from "../comparison.utils";

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
