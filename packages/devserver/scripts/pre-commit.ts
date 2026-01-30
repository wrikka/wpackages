import { execSync } from "node:child_process";

console.log("Running pre-commit hook...");

try {
	// Use npm_execpath to ensure we use the correct package manager (bun)
	const pm = process.env.npm_execpath || "bun";
	execSync(`${pm} run lint`, { stdio: "inherit" });
	console.log("Lint check passed.");
} catch (error) {
	console.error(error);
	console.error("Pre-commit hook failed: Lint check failed.");
	process.exit(1);
}
