/**
 * Example 2: Relative Performance
 */
import { calculateRelativePerformance } from "../comparison.utils";

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
