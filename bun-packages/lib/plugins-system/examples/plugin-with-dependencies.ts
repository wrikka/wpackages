/**
 * Plugin with Dependencies Example
 *
 * Shows how to create plugins with dependencies and how the system
 * automatically resolves and loads them in the correct order
 */

import type { Plugin } from "../src";

// Base plugin that others depend on
export const basePlugin: Plugin = {
	metadata: {
		id: "base-plugin",
		name: "Base Plugin",
		version: "1.0.0",
		description: "A base plugin that provides core functionality",
		author: "WTS Team",
	},
	init: async (api) => {
		console.log("📦 Base plugin initialized");

		// Provide core functionality
		api.register("core:getConfig", () => {
			return { apiVersion: "1.0", environment: "production" };
		});
	},
};

// Auth plugin that depends on base plugin
export const authPlugin: Plugin = {
	metadata: {
		id: "auth-plugin",
		name: "Auth Plugin",
		version: "1.0.0",
		description: "Authentication plugin that depends on base plugin",
		author: "WTS Team",
	},
	dependencies: [{ id: "base-plugin", version: "1.0.0" }],
	init: async (api) => {
		console.log("🔐 Auth plugin initialized");

		api.register("auth:login", (username: string, _password: string) => {
			// Simulate authentication
			return { token: `token-${username}`, expiresIn: 3600 };
		});
	},
};

// User plugin that depends on auth plugin
export const userPlugin: Plugin = {
	metadata: {
		id: "user-plugin",
		name: "User Plugin",
		version: "1.0.0",
		description: "User management plugin that depends on auth",
		author: "WTS Team",
	},
	dependencies: [
		{ id: "auth-plugin", version: "1.0.0" },
		{ id: "base-plugin", version: "1.0.0" },
	],
	init: async (api) => {
		console.log("👤 User plugin initialized");

		api.register("user:getProfile", (userId: string) => {
			return { id: userId, name: "John Doe", email: "john@example.com" };
		});
	},
};

// Plugin with optional dependency
export const analyticsPlugin: Plugin = {
	metadata: {
		id: "analytics-plugin",
		name: "Analytics Plugin",
		version: "1.0.0",
		description: "Analytics plugin with optional dependencies",
		author: "WTS Team",
	},
	dependencies: [
		{ id: "base-plugin", version: "1.0.0" },
		{ id: "tracking-plugin", version: "1.0.0", optional: true },
	],
	init: async (api) => {
		console.log("📊 Analytics plugin initialized");

		api.register("analytics:track", (event: string, data?: unknown) => {
			console.log(`Track event: ${event}`, data);
		});
	},
};

// Usage example:
if (import.meta.main) {
	const { createPluginManager, createPluginLogger, sortPluginsByDependencies } = await import("../src");

	const logger = createPluginLogger({ level: "info" });
	const manager = createPluginManager({
		pluginDir: "./plugins",
		logger,
	});

	try {
		console.log("=== Installing plugins with dependencies ===\n");

		// The system automatically sorts plugins by dependencies
		const plugins = [userPlugin, authPlugin, basePlugin, analyticsPlugin];
		const sorted = sortPluginsByDependencies(plugins);

		console.log(
			"Load order:",
			sorted.map((p) => p.metadata.id),
		);
		console.log();

		// Install plugins in dependency order
		for (const plugin of sorted) {
			await manager.install(plugin);
			console.log(`✓ Installed: ${plugin.metadata.name}`);
		}

		console.log("\n=== Enabling plugins ===\n");

		// Enable plugins
		for (const plugin of sorted) {
			await manager.enable(plugin.metadata.id);
			console.log(`✓ Enabled: ${plugin.metadata.name}`);
		}

		console.log("\n=== Plugin Status ===\n");

		// Show all enabled plugins
		const enabled = manager.getEnabled();
		console.log(`Total enabled plugins: ${enabled.length}`);
		for (const state of enabled) {
			console.log(`  - ${state.plugin.metadata.name} (${state.status})`);
		}
	} catch (error) {
		console.error("Error:", error);
	}
}
