/**
 * Example 8: Benchmark Comparison Table
 */
import { formatRatio, percentageDifference } from "../comparison.utils";

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
