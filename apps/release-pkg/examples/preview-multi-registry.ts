/**
 * Multi-registry preview example - publish to multiple registries
 */

import { RegistryService, VersionService, type RegistryConfig } from "release";

async function main() {
	const registry = new RegistryService();
	const version = new VersionService();

	const packageInfo = await version.getPackageInfo();
	console.log(`Package: ${packageInfo.name}@${packageInfo.version}`);

	// Publish to multiple registries
	const results = await registry.publishToRegistries([
		{
			type: "npm",
			url: "https://registry.npmjs.org",
		},
		{
			type: "jsr",
			url: "https://jsr.io",
		},
		{
			type: "github" as const,
			url: "https://npm.pkg.github.com",
			token: process.env["GITHUB_TOKEN"] ?? undefined,
		} as RegistryConfig,
	]);

	// Show results
	console.log("\n📊 Publish Results:");
	for (const [registryType, result] of results) {
		if (result.success) {
			console.log(`✅ ${registryType}: ${result.url}`);
		} else {
			console.log(`❌ ${registryType}: ${result.error}`);
		}
	}
}

main();
