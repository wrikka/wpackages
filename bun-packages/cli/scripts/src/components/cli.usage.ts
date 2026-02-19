/**
 * CLI Components Usage Examples
 *
 * This file demonstrates how to use the CLI rendering components
 * for displaying script information, results, and help messages.
 */

import type { Script, ScriptResult } from "../types";
import { renderHelp, renderScriptInfo, renderScriptList, renderScriptResults } from "./cli";

// ============================================================================
// renderScriptInfo - Render script information
// ============================================================================

const renderScriptInfoExample = () => {
	console.log("=== Render Script Info Example ===\n");

	const script: Script = {
		name: "build",
		description: "Build the project",
		command: "bun run build",
		cwd: "./src",
		dependencies: ["lint"],
		parallel: false,
	};

	console.log(renderScriptInfo(script));
	console.log("\n");
};

// ============================================================================
// renderScriptList - Render list of scripts
// ============================================================================

const renderScriptListExample = () => {
	console.log("=== Render Script List Example ===\n");

	const scripts: Script[] = [
		{
			name: "build",
			description: "Build the project",
			command: "bun run build",
		},
		{
			name: "test",
			description: "Run tests",
			command: "bun run test",
		},
		{
			name: "lint",
			description: "Lint code",
			command: "bun run lint",
		},
		{
			name: "deploy",
			description: "Deploy to production",
			command: "bun run deploy",
		},
	];

	console.log(renderScriptList(scripts));
	console.log("\n");
};

// ============================================================================
// renderScriptResults - Render script execution results
// ============================================================================

const renderScriptResultsExample = () => {
	console.log("=== Render Script Results Example ===\n");

	const results: ScriptResult[] = [
		{
			name: "build",
			success: true,
			output: "Build completed in 2.5s\nGenerated 42 files",
			duration: 2500,
		},
		{
			name: "test",
			success: true,
			output: "All tests passed (45 tests)",
			duration: 3200,
		},
		{
			name: "lint",
			success: false,
			error:
				"Linting failed: 3 errors found\n  - src/index.ts:10: unused variable\n  - src/utils.ts:5: missing semicolon",
			duration: 800,
		},
	];

	console.log(renderScriptResults(results));
	console.log("\n");
};

// ============================================================================
// renderScriptResults - Render empty results
// ============================================================================

const renderEmptyResultsExample = () => {
	console.log("=== Render Empty Results Example ===\n");

	const results: ScriptResult[] = [];
	console.log(renderScriptResults(results));
	console.log("\n");
};

// ============================================================================
// renderScriptList - Render empty list
// ============================================================================

const renderEmptyListExample = () => {
	console.log("=== Render Empty List Example ===\n");

	const scripts: Script[] = [];
	console.log(renderScriptList(scripts));
	console.log("\n");
};

// ============================================================================
// renderHelp - Render help information
// ============================================================================

const renderHelpExample = () => {
	console.log("=== Render Help Example ===\n");

	console.log(renderHelp());
	console.log("\n");
};

// ============================================================================
// Combined Usage Example - Dashboard-like Output
// ============================================================================

const dashboardExample = () => {
	console.log("=== Dashboard Example ===\n");

	const scripts: Script[] = [
		{
			name: "build",
			description: "Build the project",
			command: "bun run build",
		},
		{
			name: "test",
			description: "Run tests",
			command: "bun run test",
			dependencies: ["build"],
		},
		{
			name: "deploy",
			description: "Deploy to production",
			command: "bun run deploy",
			dependencies: ["test"],
		},
	];

	const results: ScriptResult[] = [
		{
			name: "build",
			success: true,
			output: "Build completed successfully",
			duration: 2500,
		},
		{
			name: "test",
			success: true,
			output: "All tests passed",
			duration: 3200,
		},
		{
			name: "deploy",
			success: true,
			output: "Deployment completed",
			duration: 1800,
		},
	];

	console.log("📋 Available Scripts:");
	console.log("─".repeat(50));
	console.log(renderScriptList(scripts));

	console.log("\n📊 Execution Results:");
	console.log("─".repeat(50));
	console.log(renderScriptResults(results));
};

// ============================================================================
// Detailed Script Information Example
// ============================================================================

const detailedInfoExample = () => {
	console.log("=== Detailed Script Information Example ===\n");

	const scripts: Script[] = [
		{
			name: "build",
			description: "Build the project",
			command: "bun run build",
			cwd: "./src",
			dependencies: ["lint"],
		},
		{
			name: "test",
			description: "Run tests with coverage",
			command: "bun run test --coverage",
			cwd: "./tests",
			dependencies: ["build"],
		},
	];

	scripts.forEach((script) => {
		console.log(`📄 ${script.name.toUpperCase()}`);
		console.log("─".repeat(50));
		console.log(renderScriptInfo(script));
		console.log("\n");
	});
};

// ============================================================================
// Run all examples
// ============================================================================

export const runCliComponentsExamples = () => {
	renderScriptInfoExample();
	renderScriptListExample();
	renderScriptResultsExample();
	renderEmptyResultsExample();
	renderEmptyListExample();
	renderHelpExample();
	dashboardExample();
	detailedInfoExample();
};

// Export individual examples for selective use
export {
	dashboardExample,
	detailedInfoExample,
	renderEmptyListExample,
	renderEmptyResultsExample,
	renderHelpExample,
	renderScriptInfoExample,
	renderScriptListExample,
	renderScriptResultsExample,
};
