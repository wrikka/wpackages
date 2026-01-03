/**
 * Custom version example - specify exact version
 */

import { ReleaseOrchestrator } from "release";

async function main() {
	const orchestrator = new ReleaseOrchestrator();

	// Release specific version
	const result = await orchestrator.release({
		version: "2.0.0",
		verbose: true,
	});

	console.log(`✅ Released specific version: ${result.version}`);
}

main();
