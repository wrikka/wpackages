/**
 * Dry run example - preview release without making changes
 */

import { release } from "../src/index";

async function main() {
	// Preview what will happen without actually releasing
	const result = await release({
		type: "minor",
		dryRun: true,
		verbose: true,
	});

	console.log("\n🔍 Dry Run Results:");
	console.log(`Previous: ${result.previousVersion}`);
	console.log(`New: ${result.version}`);
	console.log(`Would be published: ${result.published}`);
}

void main();
