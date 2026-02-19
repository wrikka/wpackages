/**
 * Release without publishing to npm
 * Useful for private packages or when you want to publish manually
 */

import { release } from "../src/index";

async function main() {
	const result = await release({
		type: "patch",
		noPublish: true, // Skip npm publish
		verbose: true,
		dryRun: true,
	});

	console.log(`✅ Released ${result.version} (not published to npm)`);
	console.log("📦 You can manually publish with: npm publish");
}

void main();
