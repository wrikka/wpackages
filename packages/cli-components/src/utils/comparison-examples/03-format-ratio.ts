/**
 * Example 3: Format Ratio
 */
import { formatRatio } from "../comparison.utils";

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
