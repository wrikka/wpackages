/**
 * Release without publishing to npm
 * Useful for private packages or when you want to publish manually
 */

import { ReleaseOrchestrator } from "release";

async function main() {
	const orchestrator = new ReleaseOrchestrator();

	const result = await orchestrator.release({
		type: "patch",
		noPublish: true, // Skip npm publish
		verbose: true,
	});

	console.log(`✅ Released ${result.version} (not published to npm)`);
	console.log("📦 You can manually publish with: npm publish");
}

main();
