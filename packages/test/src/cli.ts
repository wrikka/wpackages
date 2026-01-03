#!/usr/bin/env bun

/**
 * The command-line interface for the test runner.
 */

import { exists } from "bun:fs";
import { resolve } from "node:path";
import { executeTests } from "./app";
import { createConfig } from "./config";
import type { TestConfig } from "./config";

async function main() {
	let userConfig: Partial<TestConfig> = {};
	const configPath = resolve(process.cwd(), "wtest.config.ts");

	if (await exists(configPath)) {
		try {
			const configModule = await import(configPath);
			if (configModule.default) {
				userConfig = configModule.default;
			}
			console.log(`Loaded config from: ${configPath}`);
		} catch (error) {
			console.error(`Error loading config file at ${configPath}:`, error);
			process.exit(1);
		}
	}

	const finalConfig = createConfig(userConfig);

	await executeTests(finalConfig);
}

main().catch((error) => {
	console.error("An unexpected error occurred while running tests:", error);
	process.exit(1);
});
