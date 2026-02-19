/**
 * Example 9: CI/CD Performance Monitoring
 */
import { percentageDifference } from "../comparison.utils";

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
