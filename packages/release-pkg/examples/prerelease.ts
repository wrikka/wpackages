/**
 * Prerelease example - create beta/alpha releases
 */

import { ReleaseOrchestrator } from "release";

async function main() {
	const orchestrator = new ReleaseOrchestrator();

	// Create a beta prerelease
	const result = await orchestrator.release({
		type: "prepatch",
		preid: "beta",
		verbose: true,
	});

	console.log(`\n✅ Created prerelease: ${result.version}`);

	// To increment the prerelease: 1.0.0-beta.0 → 1.0.0-beta.1
	// const nextBeta = await orchestrator.release({
	//   type: 'prerelease',
	//   verbose: true
	// });
}

main();
