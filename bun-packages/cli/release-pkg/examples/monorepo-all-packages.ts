import { release } from "@wpackages/release-pkg";

// Release all packages in monorepo
const result = await release({
	type: "patch",
	verbose: true,
});

console.log(`Released ${result.packages?.length || 0} packages`);
console.log(`Success: ${result.success}`);
console.log(`Duration: ${result.duration}ms`);

if (result.packages) {
	for (const pkg of result.packages) {
		console.log(`  - ${pkg.name}: ${pkg.previousVersion} → ${pkg.version} (${pkg.success ? "✓" : "✗"})`);
	}
}
