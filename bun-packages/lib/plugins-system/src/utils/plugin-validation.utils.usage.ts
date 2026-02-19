/**
 * Usage examples for plugin validation utilities
 */

import type { Plugin, PluginMetadata } from "../types";
import { isPluginCompatible, validatePlugin, validatePluginMetadata } from "./plugin-validation.utils";

// Example 1: Validate plugin metadata
console.log("=== Example 1: Validate Plugin Metadata ===");

// Valid metadata
const validMetadata: PluginMetadata = {
	id: "my-plugin",
	name: "My Plugin",
	version: "1.0.0",
	author: "John Doe",
	description: "A sample plugin",
};

const errors1 = validatePluginMetadata(validMetadata);
console.log(
	`Valid metadata errors: ${errors1.length === 0 ? "None" : errors1.join(", ")}`,
);

// Invalid metadata - missing fields
const invalidMetadata1: PluginMetadata = {
	id: "",
	name: "",
	version: "1.0.0",
	author: "John Doe",
	description: "Test description",
};

const errors2 = validatePluginMetadata(invalidMetadata1);
console.log(`Invalid metadata (empty fields) errors:`);
errors2.forEach((error) => console.log(`  - ${error}`));

// Invalid metadata - bad version format
const invalidMetadata2: PluginMetadata = {
	id: "my-plugin",
	name: "My Plugin",
	version: "v1.0",
	author: "John Doe",
	description: "Test description",
};

const errors3 = validatePluginMetadata(invalidMetadata2);
console.log(`Invalid metadata (bad version) errors:`);
errors3.forEach((error) => console.log(`  - ${error}`));

// Example 2: Validate complete plugin
console.log("\n=== Example 2: Validate Complete Plugin ===");

// Valid plugin
const validPlugin: Plugin = {
	metadata: {
		id: "auth-plugin",
		name: "Authentication Plugin",
		version: "2.0.0",
		author: "Security Team",
		description: "Handles user authentication",
	},
	dependencies: [
		{ id: "core", version: "1.0.0" },
		{ id: "crypto", version: "1.5.0" },
	],
	init: async () => {
		console.log("Plugin initialized");
	},
	hooks: {
		onEnable: async () => {},
		onDisable: async () => {},
	},
};

const pluginErrors1 = validatePlugin(validPlugin);
console.log(
	`Valid plugin errors: ${pluginErrors1.length === 0 ? "None" : pluginErrors1.join(", ")}`,
);

// Invalid plugin - no init function
const invalidPlugin1: Plugin = {
	metadata: {
		id: "broken-plugin",
		name: "Broken Plugin",
		version: "1.0.0",
		author: "Unknown",
		description: "Test description",
	},
	init: "not a function" as unknown as () => Promise<void>,
};

const pluginErrors2 = validatePlugin(invalidPlugin1);
console.log(`Invalid plugin (no init) errors:`);
pluginErrors2.forEach((error) => console.log(`  - ${error}`));

// Invalid plugin - bad dependencies
const invalidPlugin2: Plugin = {
	metadata: {
		id: "bad-deps",
		name: "Bad Dependencies",
		version: "1.0.0",
		author: "Unknown",
		description: "Test description",
	},
	dependencies: [
		{ id: "", version: "1.0.0" },
		{ id: "core", version: "" },
	],
	init: async () => {},
};

const pluginErrors3 = validatePlugin(invalidPlugin2);
console.log(`Invalid plugin (bad dependencies) errors:`);
pluginErrors3.forEach((error) => console.log(`  - ${error}`));

// Example 3: Check plugin compatibility
console.log("\n=== Example 3: Check Plugin Compatibility ===");

// Compatible versions
const compatibilityTests = [
	{ required: "1.0.0", actual: "1.0.0", expected: true },
	{ required: "1.0.0", actual: "1.0.5", expected: true },
	{ required: "1.0.0", actual: "1.2.0", expected: true },
	{ required: "1.5.0", actual: "1.5.3", expected: true },
	{ required: "1.5.0", actual: "1.4.9", expected: false },
	{ required: "1.0.0", actual: "2.0.0", expected: false },
	{ required: "2.0.0", actual: "1.9.9", expected: false },
	{ required: "1.5.3", actual: "1.5.0", expected: false },
];

console.log("Compatibility checks:");
for (const test of compatibilityTests) {
	const result = isPluginCompatible(test.required, test.actual);
	const status = result === test.expected ? "✓" : "✗";
	console.log(
		`  ${status} Required: ${test.required}, Actual: ${test.actual} => ${result ? "Compatible" : "Incompatible"}`,
	);
}

// Example 4: Validate plugin with all optional fields
console.log("\n=== Example 4: Validate Plugin with Optional Fields ===");

const fullPlugin: Plugin = {
	metadata: {
		id: "full-featured-plugin",
		name: "Full Featured Plugin",
		version: "3.2.1",
		author: "Development Team",
		description: "A plugin with all optional fields",
		homepage: "https://example.com",
		license: "MIT",
	},
	dependencies: [
		{ id: "core", version: "1.0.0", optional: false },
		{ id: "premium", version: "2.0.0", optional: true },
	],
	capabilities: {
		hotReload: true,
		sandboxed: false,
		priority: "high",
	},
	init: async (_api) => {
		console.log("Initializing with API");
	},
	hooks: {
		onInstall: async () => console.log("Installing"),
		onEnable: async () => console.log("Enabling"),
		onDisable: async () => console.log("Disabling"),
		onUninstall: async () => console.log("Uninstalling"),
	},
};

const fullErrors = validatePlugin(fullPlugin);
console.log(
	`Full plugin validation: ${fullErrors.length === 0 ? "✓ Valid" : "✗ Invalid"}`,
);

// Example 5: Real-world validation workflow
console.log("\n=== Example 5: Real-World Validation Workflow ===");

const pluginsToValidate: Plugin[] = [
	{
		metadata: {
			id: "plugin-1",
			name: "Plugin 1",
			version: "1.0.0",
			author: "Author 1",
			description: "Test description",
		},
		init: async () => {},
	},
	{
		metadata: {
			id: "",
			name: "Plugin 2",
			version: "bad-version",
			author: "Author 2",
			description: "Test description",
		},
		init: async () => {},
	},
	{
		metadata: {
			id: "plugin-3",
			name: "Plugin 3",
			version: "2.0.0",
			author: "Author 3",
			description: "Test description",
		},
		dependencies: [{ id: "missing-dep", version: "" }],
		init: async () => {},
	},
];

console.log("Validating plugins:");
for (const plugin of pluginsToValidate) {
	const errors = validatePlugin(plugin);
	if (errors.length === 0) {
		console.log(`  ✓ ${plugin.metadata.id || "unknown"}: Valid`);
	} else {
		console.log(`  ✗ ${plugin.metadata.id || "unknown"}: Invalid`);
		errors.forEach((error) => console.log(`    - ${error}`));
	}
}

// Example 6: Version compatibility matrix
console.log("\n=== Example 6: Version Compatibility Matrix ===");

const versions = ["1.0.0", "1.5.0", "2.0.0"];
const requiredVersion = "1.5.0";

console.log(`Required version: ${requiredVersion}`);
console.log("Compatibility matrix:");
for (const version of versions) {
	const compatible = isPluginCompatible(requiredVersion, version);
	console.log(
		`  ${version}: ${compatible ? "✓ Compatible" : "✗ Incompatible"}`,
	);
}

console.log("\n✓ All examples completed");
