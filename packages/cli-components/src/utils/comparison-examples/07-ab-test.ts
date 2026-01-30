/**
 * Example 7: A/B Test Comparison
 */
import { calculateSpeedup, formatRatio, percentageDifference } from "../comparison.utils";

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
