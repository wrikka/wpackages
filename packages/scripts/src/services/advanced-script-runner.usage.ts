/**
 * Advanced Script Runner Usage Examples
 *
 * This file demonstrates how to use advanced features like:
 * - Timeout handling
 * - Retry mechanism
 * - Dry-run mode
 * - Advanced validation
 */

import type { Script } from "../types";
import { dryRunScript, formatScriptExecutionInfo, validateAdvancedScriptConfig } from "./advanced-script-runner";

// ============================================================================
// Timeout Support Example
// ============================================================================

const timeoutExample = () => {
	console.log("=== Timeout Support Example ===\n");

	const scripts: Script[] = [
		{
			name: "quick-build",
			description: "Fast build with 5s timeout",
			command: "bun run build",
			timeout: 5000,
		},
		{
			name: "slow-test",
			description: "Long-running tests with 30s timeout",
			command: "bun run test",
			timeout: 30000,
		},
		{
			name: "deploy",
			description: "Deployment with 60s timeout",
			command: "bun run deploy",
			timeout: 60000,
		},
	];

	console.log("Scripts with timeout configuration:");
	scripts.forEach((script) => {
		console.log(`  - ${script.name}: ${script.timeout}ms`);
	});
	console.log("\n");
};

// ============================================================================
// Retry Mechanism Example
// ============================================================================

const retryExample = () => {
	console.log("=== Retry Mechanism Example ===\n");

	const scripts: Script[] = [
		{
			name: "fetch-data",
			description: "Fetch data with 3 retries",
			command: "curl https://api.example.com/data",
			retries: 3,
			retryDelay: 1000,
		},
		{
			name: "deploy",
			description: "Deploy with 5 retries and 2s delay",
			command: "bun run deploy",
			retries: 5,
			retryDelay: 2000,
		},
		{
			name: "backup",
			description: "Backup with 2 retries",
			command: "bun run backup",
			retries: 2,
			retryDelay: 500,
		},
	];

	console.log("Scripts with retry configuration:");
	scripts.forEach((script) => {
		console.log(`  - ${script.name}:`);
		console.log(`    Retries: ${script.retries}`);
		console.log(`    Retry Delay: ${script.retryDelay}ms`);
	});
	console.log("\n");
};

// ============================================================================
// Dry-Run Mode Example
// ============================================================================

const dryRunExample = () => {
	console.log("=== Dry-Run Mode Example ===\n");

	const scripts: Script[] = [
		{
			name: "build",
			description: "Build the project",
			command: "bun run build",
			cwd: "./src",
			dryRun: true,
		},
		{
			name: "test",
			description: "Run tests",
			command: "bun run test",
			dryRun: true,
		},
		{
			name: "deploy",
			description: "Deploy to production",
			command: "bun run deploy",
			dryRun: true,
		},
	];

	console.log("Dry-run results (simulated execution):");
	scripts.forEach((script) => {
		const result = dryRunScript(script);
		console.log(`\n${result.name}:`);
		console.log(result.output);
	});
	console.log("\n");
};

// ============================================================================
// Continue on Error Example
// ============================================================================

const continueOnErrorExample = () => {
	console.log("=== Continue on Error Example ===\n");

	const scripts: Script[] = [
		{
			name: "lint",
			description: "Lint code",
			command: "bun run lint",
			continueOnError: false,
		},
		{
			name: "test",
			description: "Run tests",
			command: "bun run test",
			continueOnError: false,
		},
		{
			name: "cleanup",
			description: "Cleanup (continues even if test fails)",
			command: "bun run cleanup",
			continueOnError: true,
		},
	];

	console.log("Scripts with error handling:");
	scripts.forEach((script) => {
		console.log(
			`  - ${script.name}: ${script.continueOnError ? "continues on error" : "stops on error"}`,
		);
	});
	console.log("\n");
};

// ============================================================================
// Advanced Configuration Validation Example
// ============================================================================

const validationExample = () => {
	console.log("=== Configuration Validation Example ===\n");

	const validScript: Script = {
		name: "build",
		command: "bun run build",
		timeout: 5000,
		retries: 3,
		retryDelay: 1000,
	};

	const invalidScripts: Script[] = [
		{
			name: "bad-timeout",
			command: "bun run test",
			timeout: -1,
		},
		{
			name: "bad-retries",
			command: "bun run deploy",
			retries: -5,
		},
		{
			name: "bad-delay",
			command: "bun run backup",
			retryDelay: -100,
		},
	];

	console.log("Valid script:");
	const validErrors = validateAdvancedScriptConfig(validScript);
	console.log(`  - ${validScript.name}: ${validErrors.length === 0 ? "✓ valid" : "✗ invalid"}`);

	console.log("\nInvalid scripts:");
	invalidScripts.forEach((script) => {
		const errors = validateAdvancedScriptConfig(script);
		console.log(`  - ${script.name}:`);
		errors.forEach((error) => console.log(`    ✗ ${error}`));
	});
	console.log("\n");
};

// ============================================================================
// Format Script Execution Info Example
// ============================================================================

const formatInfoExample = () => {
	console.log("=== Format Script Execution Info Example ===\n");

	const scripts: Script[] = [
		{
			name: "build",
			description: "Build the project",
			command: "bun run build",
			timeout: 10000,
		},
		{
			name: "deploy",
			description: "Deploy to production",
			command: "bun run deploy",
			timeout: 60000,
			retries: 3,
			retryDelay: 2000,
			dryRun: true,
			continueOnError: true,
		},
	];

	scripts.forEach((script) => {
		console.log(`📋 ${script.name.toUpperCase()}`);
		console.log("─".repeat(50));
		console.log(formatScriptExecutionInfo(script));
		console.log("\n");
	});
};

// ============================================================================
// Complex Pipeline Example
// ============================================================================

const complexPipelineExample = () => {
	console.log("=== Complex Pipeline Example ===\n");

	const pipeline: Script[] = [
		{
			name: "lint",
			description: "Lint code",
			command: "bun run lint",
			timeout: 5000,
		},
		{
			name: "build",
			description: "Build project",
			command: "bun run build",
			timeout: 15000,
			dependencies: ["lint"],
		},
		{
			name: "test",
			description: "Run tests",
			command: "bun run test",
			timeout: 30000,
			retries: 2,
			retryDelay: 1000,
			dependencies: ["build"],
		},
		{
			name: "coverage",
			description: "Generate coverage report",
			command: "bun run coverage",
			timeout: 20000,
			dependencies: ["test"],
			continueOnError: true,
		},
		{
			name: "deploy",
			description: "Deploy to production",
			command: "bun run deploy",
			timeout: 60000,
			retries: 3,
			retryDelay: 2000,
			dependencies: ["test"],
		},
	];

	console.log("Pipeline configuration:");
	pipeline.forEach((script) => {
		console.log(`\n${script.name}:`);
		console.log(formatScriptExecutionInfo(script));
	});
	console.log("\n");
};

// ============================================================================
// Run all examples
// ============================================================================

export const runAdvancedScriptRunnerExamples = () => {
	timeoutExample();
	retryExample();
	dryRunExample();
	continueOnErrorExample();
	validationExample();
	formatInfoExample();
	complexPipelineExample();
};

// Export individual examples for selective use
export {
	complexPipelineExample,
	continueOnErrorExample,
	dryRunExample,
	formatInfoExample,
	retryExample,
	timeoutExample,
	validationExample,
};
