/**
 * Monorepo preview example - auto-detect and publish changed packages
 */

import { MonorepoService, PreviewService } from "release";

async function main() {
	const monorepo = new MonorepoService();
	const preview = new PreviewService();

	// Check if monorepo
	const isMonorepo = await monorepo.isMonorepo();
	console.log(`Monorepo: ${isMonorepo ? "Yes" : "No"}`);

	if (!isMonorepo) {
		console.log("Not a monorepo, use basic preview instead");
		return;
	}

	// Get monorepo config
	const config = await monorepo.getConfig();
	console.log(`Tool: ${config?.tool}`);
	console.log(`Packages: ${config?.packages.join(", ")}`);

	// Get changed packages since last commit
	const changedPackages = await monorepo.getChangedPackages("HEAD~1");
	console.log(`\nChanged packages: ${changedPackages.length}`);

	for (const pkg of changedPackages) {
		if (pkg.private) {
			console.log(`⏭️  Skipping private: ${pkg.name}`);
			continue;
		}

		console.log(`\n📦 Publishing preview: ${pkg.name}`);

		// Change to package directory
		process.chdir(pkg.path);

		const result = await preview.publishPreview({
			ttl: 7,
		});

		console.log(`✅ ${result.url}`);
	}
}

main();
