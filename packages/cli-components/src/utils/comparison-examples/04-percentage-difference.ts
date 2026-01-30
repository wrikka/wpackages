/**
 * Example 4: Percentage Difference
 */
import { percentageDifference } from "../comparison.utils";

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
