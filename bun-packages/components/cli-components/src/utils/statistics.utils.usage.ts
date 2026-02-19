import {
	calculatePercentiles,
	calculateStatistics,
	formatNumber,
	formatOps,
	formatPercentage,
	formatTime,
	mean,
	median,
	opsPerSecond,
	standardDeviation,
} from "./statistics.utils";

/**
 * ตัวอย่างการใช้งาน statisticsUtils
 *
 * Run: bun run components/tui/src/utils/statistics.utils.usage.ts
 */

console.log("--- Statistics Utils Usage Example ---");

const sampleTimes = [10.5, 12.1, 9.8, 11.5, 13.2, 10.9, 11.1, 12.5, 10.2, 11.8];
console.log(`\nSample Data (ms): [${sampleTimes.join(", ")}]`);

// 1. Basic statistics
const avg = mean(sampleTimes);
const med = median(sampleTimes);
const stdDev = standardDeviation(sampleTimes);

console.log(`\n--- Basic Calculations ---`);
console.log(`Mean: ${avg.toFixed(2)} ms`);
console.log(`Median: ${med.toFixed(2)} ms`);
console.log(`Standard Deviation: ${stdDev.toFixed(2)} ms`);

// 2. Percentiles
const percentiles = calculatePercentiles(sampleTimes);
console.log(`\n--- Percentiles ---`);
console.log(`p50 (Median): ${percentiles.p50.toFixed(2)} ms`);
console.log(`p95: ${percentiles.p95.toFixed(2)} ms`);
console.log(`p99: ${percentiles.p99.toFixed(2)} ms`);

// 3. Full statistics object
const stats = calculateStatistics(sampleTimes);
console.log(`\n--- Full Statistics Object ---`);
console.log(stats);

// 4. Formatting utilities
console.log(`\n--- Formatting ---`);
console.log(`Formatted Mean Time: ${formatTime(avg)}`);
console.log(`Formatted Large Number: ${formatNumber(1234567.89)}`);
console.log(`Formatted Ops/Sec: ${formatOps(opsPerSecond(avg))}`);
console.log(`Formatted Percentage: ${formatPercentage(stats.relativeMarginOfError)}`);

console.log("\n--- End of Example ---");
