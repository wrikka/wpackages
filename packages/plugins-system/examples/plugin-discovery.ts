/**
 * Plugin Discovery Example
 *
 * Shows how to automatically discover and load plugins from directories
 */

import { join } from "node:path";

// Usage example:
if (import.meta.main) {
	const { createPluginManager, createPluginLogger, discoverPlugins } = await import("../src");

	const logger = createPluginLogger({ level: "info" });
	const manager = createPluginManager({
		pluginDir: "./plugins",
		logger,
	});

	try {
		console.log("=== Discovering Plugins ===\n");

		// Discover plugins from multiple directories
		const result = await discoverPlugins({
			paths: [join(import.meta.dir, "../plugins"), join(import.meta.dir, "./")],
			patterns: ["**/*.plugin.ts", "**/*.plugin.js"],
			autoLoad: true,
		});

		console.log(`Found ${result.found.length} plugin files`);
		console.log(`Successfully loaded ${result.loaded.length} plugins`);

		if (result.errors.length > 0) {
			console.log(`\n⚠️  Errors (${result.errors.length}):`);
			for (const error of result.errors) {
				console.log(`  - ${error.path}: ${error.error}`);
			}
		}

		console.log("\n=== Discovered Plugins ===\n");

		for (const plugin of result.loaded) {
			console.log(`📦 ${plugin.metadata.name}`);
			console.log(`   ID: ${plugin.metadata.id}`);
			console.log(`   Version: ${plugin.metadata.version}`);
			console.log(`   Description: ${plugin.metadata.description}`);
			if (plugin.dependencies && plugin.dependencies.length > 0) {
				console.log(
					`   Dependencies: ${plugin.dependencies.map((d) => d.id).join(", ")}`,
				);
			}
			console.log();
		}

		if (result.loaded.length > 0) {
			console.log("=== Installing Discovered Plugins ===\n");

			// Install and enable all discovered plugins
			for (const plugin of result.loaded) {
				try {
					await manager.install(plugin);
					await manager.enable(plugin.metadata.id);
					console.log(`✓ ${plugin.metadata.name} installed and enabled`);
				} catch (error) {
					console.error(`✗ Failed to install ${plugin.metadata.name}:`, error);
				}
			}

			console.log("\n=== All Plugins Status ===\n");

			const allPlugins = manager.getAll();
			for (const state of allPlugins) {
				const icon = state.status === "enabled"
					? "🟢"
					: state.status === "error"
					? "🔴"
					: "⚪";
				console.log(`${icon} ${state.plugin.metadata.name} - ${state.status}`);
			}
		}
	} catch (error) {
		console.error("Discovery error:", error);
	}
}
