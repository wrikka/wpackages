/**
 * Example 1: Calculate Speedup
 */
import { calculateSpeedup } from "../comparison.utils";

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
