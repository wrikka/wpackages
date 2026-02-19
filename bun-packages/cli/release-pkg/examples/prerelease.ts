/**
 * Prerelease example - create beta/alpha releases
 */

import { release } from "../src/index";

async function main() {
	// Create a beta prerelease
	const result = await release({
		type: "prepatch",
		preid: "beta",
		verbose: true,
		dryRun: true,
	});

	console.log(`\n✅ Created prerelease: ${result.version}`);

	// To increment the prerelease: 1.0.0-beta.0 → 1.0.0-beta.1
	// const nextBeta = await orchestrator.release({
	//   type: 'prerelease',
	//   verbose: true
	// });
}

void main();
