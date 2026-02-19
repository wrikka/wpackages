import { release } from "@wpackages/release-pkg";

// Release specific workspace/package in monorepo
const result = await release({
	type: "patch",
	workspace: "packages/my-package", // or package name
	verbose: true,
});

console.log(`Released ${result.version}`);
console.log(`Success: ${result.success}`);
console.log(`Duration: ${result.duration}ms`);

if (result.packages) {
	for (const pkg of result.packages) {
		console.log(`  - ${pkg.name}: ${pkg.previousVersion} → ${pkg.version} (${pkg.success ? "✓" : "✗"})`);
	}
}
