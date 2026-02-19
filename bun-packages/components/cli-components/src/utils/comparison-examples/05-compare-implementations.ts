/**
 * Example 5: Comparing Multiple Implementations
 */
import { formatRatio, percentageDifference } from "../comparison.utils";

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
