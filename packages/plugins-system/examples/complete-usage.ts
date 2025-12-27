/**
 * Complete Usage Example
 *
 * Demonstrates all major features:
 * - Plugin lifecycle management
 * - Event system
 * - Metrics and health checks
 * - Storage (save/load state)
 * - Error handling
 */

import type { Plugin } from "../src";

// Demo plugins
const dataPlugin: Plugin = {
	metadata: {
		id: "data-plugin",
		name: "Data Plugin",
		version: "1.0.0",
		description: "Provides data storage functionality",
		author: "WTS Team",
	},
	capabilities: {
		priority: "high",
		sandboxed: false,
	},
	init: async (api) => {
		const store = new Map<string, unknown>();

		api.register("data:set", (key: string, value: unknown) => {
			store.set(key, value);
			api.emit("data:changed", { key, value });
		});

		api.register("data:get", (key: string) => {
			return store.get(key);
		});
	},
	hooks: {
		onEnable: async () => {
			console.log("🗄️  Data storage ready");
		},
	},
};

const notificationPlugin: Plugin = {
	metadata: {
		id: "notification-plugin",
		name: "Notification Plugin",
		version: "1.0.0",
		description: "Sends notifications",
		author: "WTS Team",
	},
	dependencies: [{ id: "data-plugin", version: "1.0.0" }],
	init: async (api) => {
		// Listen to data changes
		api.on("data:changed", (event) => {
			console.log("📬 Notification: Data changed", event);
		});

		api.register("notification:send", (message: string) => {
			console.log(`🔔 Notification: ${message}`);
		});
	},
};

// Main demo
if (import.meta.main) {
	const {
		createPluginManager,
		createPluginLogger,
		createMetricsCollector,
		createFileStorage,
	} = await import("../src");

	console.log("=== Complete Plugin System Demo ===\n");

	// 1. Setup logger
	const logger = createPluginLogger({
		level: "info",
		prefix: "[demo]",
		pretty: true,
	});

	// 2. Setup metrics
	const metrics = createMetricsCollector();

	// 3. Setup storage
	const storage = createFileStorage("./temp/plugins-state.json");

	// 4. Create plugin manager
	const manager = createPluginManager({
		pluginDir: "./plugins",
		maxPlugins: 10,
		logger,
		loadOptions: {
			validate: true,
			enableOnLoad: false,
		},
	});

	// 5. Listen to plugin events
	manager.events.on("plugin:installed", (event) => {
		logger.info("Plugin installed event", { pluginId: event.pluginId });
	});

	manager.events.on("plugin:enabled", (event) => {
		logger.info("Plugin enabled event", { pluginId: event.pluginId });
	});

	manager.events.on("plugin:error", (event) => {
		logger.error("Plugin error event", event.data, {
			pluginId: event.pluginId,
		});
	});

	try {
		// 6. Install plugins
		console.log("📦 Installing plugins...\n");

		const startInstall = performance.now();
		await manager.install(dataPlugin);
		const installTime = performance.now() - startInstall;
		metrics.recordLoad("data-plugin", installTime);

		await manager.install(notificationPlugin);

		// 7. Enable plugins
		console.log("\n✅ Enabling plugins...\n");

		const startInit = performance.now();
		await manager.enable("data-plugin");
		const initTime = performance.now() - startInit;
		metrics.recordInit("data-plugin", initTime);

		await manager.enable("notification-plugin");

		// 8. Show plugin states
		console.log("\n📊 Plugin Status:\n");
		const allPlugins = manager.getAll();
		for (const state of allPlugins) {
			console.log(`  ${state.plugin.metadata.name}:`);
			console.log(`    Status: ${state.status}`);
			console.log(`    Installed: ${state.installedAt.toISOString()}`);
			if (state.enabledAt) {
				console.log(`    Enabled: ${state.enabledAt.toISOString()}`);
			}
		}

		// 9. Show metrics
		console.log("\n📈 Metrics:\n");
		const stats = metrics.getStats();
		console.log(`  Total plugins: ${stats.totalPlugins}`);
		console.log(`  Enabled: ${stats.enabledPlugins}`);
		console.log(`  Errors: ${stats.errorPlugins}`);

		const dataMetrics = metrics.getMetrics("data-plugin");
		if (dataMetrics) {
			console.log(`\n  Data Plugin:`);
			console.log(`    Load time: ${dataMetrics.loadTime.toFixed(2)}ms`);
			console.log(`    Init time: ${dataMetrics.initTime.toFixed(2)}ms`);
			console.log(`    Error count: ${dataMetrics.errorCount}`);
		}

		// 10. Health check
		console.log("\n🏥 Health Check:\n");
		const health = metrics.checkHealth("data-plugin");
		console.log(
			`  Data Plugin: ${health.healthy ? "✅ Healthy" : "⚠️ Unhealthy"}`,
		);
		if (health.message) {
			console.log(`  Message: ${health.message}`);
		}

		// 11. Save state
		console.log("\n💾 Saving plugin state...\n");
		const registry = manager.getAll().reduce(
			(acc, state) => {
				acc[state.plugin.metadata.id] = state;
				return acc;
			},
			{} as Record<string, (typeof allPlugins)[0]>,
		);
		await storage.save(registry);
		console.log("  ✓ State saved");

		// 12. Disable and cleanup
		console.log("\n🧹 Cleanup...\n");
		await manager.disable("notification-plugin");
		await manager.disable("data-plugin");
		console.log("  ✓ Plugins disabled");

		console.log("\n✅ Demo completed successfully!");
	} catch (error) {
		logger.error("Demo failed", error);
		process.exit(1);
	}
}
