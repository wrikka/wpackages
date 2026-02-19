/**
 * Basic Plugin Example
 *
 * Shows how to create a simple plugin with basic lifecycle hooks
 */

import type { Plugin } from "../src";

export const basicPlugin: Plugin = {
	metadata: {
		id: "basic-plugin",
		name: "Basic Plugin",
		version: "1.0.0",
		description: "A simple example plugin demonstrating basic functionality",
		author: "WTS Team",
		license: "MIT",
	},
	init: async (api) => {
		console.log("🚀 Basic plugin initialized!");

		// Register a handler
		api.register("greet", (name: string) => {
			return `Hello, ${name}!`;
		});

		// Listen to events
		api.on("user:login", (data) => {
			console.log("User logged in:", data);
		});
	},
	hooks: {
		onInstall: async () => {
			console.log("📦 Installing basic plugin...");
			// Perform installation tasks (e.g., create directories, download assets)
		},
		onEnable: async () => {
			console.log("✅ Basic plugin enabled!");
			// Start services, connect to resources
		},
		onDisable: async () => {
			console.log("⏸️  Basic plugin disabled!");
			// Stop services, disconnect from resources
		},
		onUninstall: async () => {
			console.log("🗑️  Uninstalling basic plugin...");
			// Clean up (e.g., remove directories, delete data)
		},
	},
};

// Usage example:
if (import.meta.main) {
	const { createPluginManager, createPluginLogger } = await import("../src");

	const logger = createPluginLogger({ level: "debug" });
	const manager = createPluginManager({
		pluginDir: "./plugins",
		logger,
	});

	try {
		// Install the plugin
		await manager.install(basicPlugin);
		console.log("✓ Plugin installed");

		// Enable the plugin
		await manager.enable("basic-plugin");
		console.log("✓ Plugin enabled");

		// Get plugin state
		const state = manager.get("basic-plugin");
		console.log("Plugin status:", state?.status);

		// Disable the plugin
		await manager.disable("basic-plugin");
		console.log("✓ Plugin disabled");

		// Uninstall the plugin
		await manager.uninstall("basic-plugin");
		console.log("✓ Plugin uninstalled");
	} catch (error) {
		console.error("Error:", error);
	}
}
