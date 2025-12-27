/**
 * Script Utilities Usage Examples
 *
 * This file demonstrates how to use the script utility functions
 * for validating, formatting, sorting, and filtering scripts.
 */

import type { Script, ScriptResult } from "../types";
import { filterScriptsByName, formatScriptResult, isValidScript, sortScriptsByDependencies } from "./script-utils";

// ============================================================================
// isValidScript - Validate script configuration
// ============================================================================

const validateScriptExample = () => {
	console.log("=== Validate Script Example ===\n");

	// Valid script
	const validScript = {
		name: "build",
		command: "bun run build",
	};
	console.log("Valid script:", isValidScript(validScript)); // true

	// Invalid script - missing command
	const invalidScript = {
		name: "build",
	};
	console.log("Invalid script (missing command):", isValidScript(invalidScript)); // false

	// Invalid script - empty name
	const emptyNameScript = {
		name: "",
		command: "bun run build",
	};
	console.log("Invalid script (empty name):", isValidScript(emptyNameScript)); // false
};

// ============================================================================
// formatScriptResult - Format script result for display
// ============================================================================

const formatResultExample = () => {
	console.log("\n=== Format Result Example ===\n");

	// Successful result
	const successResult: ScriptResult = {
		name: "build",
		success: true,
		output: "Build completed successfully",
		duration: 1250,
	};
	console.log("Success result:");
	console.log(formatScriptResult(successResult));

	// Failed result
	const failResult: ScriptResult = {
		name: "test",
		success: false,
		error: "Test suite failed: 2 tests failed",
		duration: 3500,
	};
	console.log("\nFailed result:");
	console.log(formatScriptResult(failResult));
};

// ============================================================================
// sortScriptsByDependencies - Sort scripts by dependencies
// ============================================================================

const sortByDependenciesExample = () => {
	console.log("\n=== Sort by Dependencies Example ===\n");

	const scripts: Script[] = [
		{
			name: "deploy",
			command: "bun run deploy",
			description: "Deploy to production",
			dependencies: ["test"],
		},
		{
			name: "test",
			command: "bun run test",
			description: "Run tests",
			dependencies: ["build"],
		},
		{
			name: "build",
			command: "bun run build",
			description: "Build the project",
		},
		{
			name: "lint",
			command: "bun run lint",
			description: "Lint code",
		},
	];

	const sorted = sortScriptsByDependencies(scripts);

	console.log("Original order:");
	scripts.forEach((s) => console.log(`  - ${s.name}`));

	console.log("\nSorted by dependencies:");
	sorted.forEach((s) => console.log(`  - ${s.name}`));
	// Output:
	// - build (no dependencies)
	// - lint (no dependencies)
	// - test (depends on build)
	// - deploy (depends on test)
};

// ============================================================================
// filterScriptsByName - Filter scripts by name pattern
// ============================================================================

const filterByNameExample = () => {
	console.log("\n=== Filter by Name Example ===\n");

	const scripts: Script[] = [
		{ name: "build-app", command: "bun run build:app" },
		{ name: "build-lib", command: "bun run build:lib" },
		{ name: "test-app", command: "bun run test:app" },
		{ name: "test-lib", command: "bun run test:lib" },
		{ name: "deploy", command: "bun run deploy" },
	];

	console.log("All scripts:");
	scripts.forEach((s) => console.log(`  - ${s.name}`));

	const buildScripts = filterScriptsByName(scripts, "build");
	console.log("\nScripts matching 'build':");
	buildScripts.forEach((s) => console.log(`  - ${s.name}`));

	const testScripts = filterScriptsByName(scripts, "test");
	console.log("\nScripts matching 'test':");
	testScripts.forEach((s) => console.log(`  - ${s.name}`));

	const appScripts = filterScriptsByName(scripts, "app");
	console.log("\nScripts matching 'app':");
	appScripts.forEach((s) => console.log(`  - ${s.name}`));
};

// ============================================================================
// Combined Usage Example
// ============================================================================

const combinedExample = () => {
	console.log("\n=== Combined Usage Example ===\n");

	const scripts: Script[] = [
		{
			name: "build-app",
			command: "bun run build:app",
			description: "Build app",
		},
		{
			name: "build-lib",
			command: "bun run build:lib",
			description: "Build lib",
		},
		{
			name: "test-app",
			command: "bun run test:app",
			description: "Test app",
			dependencies: ["build-app"],
		},
		{
			name: "test-lib",
			command: "bun run test:lib",
			description: "Test lib",
			dependencies: ["build-lib"],
		},
		{
			name: "deploy",
			command: "bun run deploy",
			description: "Deploy",
			dependencies: ["test-app", "test-lib"],
		},
	];

	// Filter build scripts
	const buildScripts = filterScriptsByName(scripts, "build");
	console.log("Build scripts:");
	buildScripts.forEach((s) => console.log(`  - ${s.name}`));

	// Sort all scripts by dependencies
	const sorted = sortScriptsByDependencies(scripts);
	console.log("\nExecution order (respecting dependencies):");
	sorted.forEach((s) => console.log(`  - ${s.name}`));

	// Validate each script
	console.log("\nValidation:");
	scripts.forEach((s) => {
		const isValid = isValidScript(s);
		console.log(`  - ${s.name}: ${isValid ? "✓ valid" : "✗ invalid"}`);
	});
};

// ============================================================================
// Run all examples
// ============================================================================

export const runScriptUtilsExamples = () => {
	validateScriptExample();
	formatResultExample();
	sortByDependenciesExample();
	filterByNameExample();
	combinedExample();
};

// Export individual examples for selective use
export { combinedExample, filterByNameExample, formatResultExample, sortByDependenciesExample, validateScriptExample };
