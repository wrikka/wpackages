/**
 * Custom version example - specify exact version
 */

import { release } from "../src/index";

async function main() {
	// Release specific version
	const result = await release({
		version: "2.0.0",
		verbose: true,
		dryRun: true,
	});

	console.log(`✅ Released specific version: ${result.version}`);
}

void main();
