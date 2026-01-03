/**
 * Basic usage example of release
 */

import { ReleaseOrchestrator } from "release";

async function main() {
	const orchestrator = new ReleaseOrchestrator();

	try {
		// Simple patch release
		const result = await orchestrator.release({
			type: "patch",
			verbose: true,
		});

		console.log(`✅ Released version ${result.version}`);
		console.log(`⏱️  Took ${result.duration}ms`);
	} catch (error) {
		console.error("❌ Release failed:", error);
		process.exit(1);
	}
}

void main();
