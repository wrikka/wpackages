/**
 * Configuration Example
 *
 * This example demonstrates how to configure the scripts package
 * using the configuration manager.
 */

import { createConfigManager } from "config-manager";
import { scriptRunnerConfigSchema } from "../config";
import type { ScriptRunnerConfig } from "../types";

// Example configuration
const exampleConfig: Partial<ScriptRunnerConfig> = {
	scripts: {
		build: {
			name: "build",
			description: "Build the project",
			command: "bun run build",
			cwd: "./src",
		},
		test: {
			name: "test",
			description: "Run tests",
			command: "bun run test",
			dependencies: ["build"],
		},
		deploy: {
			name: "deploy",
			description: "Deploy the application",
			command: "bun run deploy",
			dependencies: ["test"],
			parallel: false,
		},
	},
	parallel: false,
	cwd: process.cwd(),
	env: process.env as Record<string, string>,
};

// Create config manager
const configManager = createConfigManager<ScriptRunnerConfig>({
	name: "scripts",
	defaultConfig: exampleConfig,
	schema: scriptRunnerConfigSchema,
});

// Load configuration
const loadConfigExample = async () => {
	console.log("Loading configuration...");

	try {
		const result = await configManager.load();

		console.log("Configuration loaded successfully:");
		console.log("Scripts:", Object.keys(result.config.scripts));
		console.log("Parallel execution:", result.config.parallel);
	} catch (error) {
		console.error("Error loading configuration:", error);
	}
};

// Run the example (commented out as this is an example file)
// loadConfigExample()
// 	.then(() => console.log("\nConfiguration example completed!"))
// 	.catch((error) => console.error("Error in configuration example:", error));

export default loadConfigExample;
