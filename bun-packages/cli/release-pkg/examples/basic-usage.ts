/**
 * Basic usage example of release
 */

import { release } from "../src/index";

async function main() {
	try {
		// Simple patch release
		const result = await release({
			type: "patch",
			verbose: true,
			dryRun: true,
		});

		console.log(`✅ Released version ${result.version}`);
		console.log(`⏱️  Took ${result.duration}ms`);
	} catch (error) {
		console.error("❌ Release failed:", error);
		process.exit(1);
	}
}

void main();
