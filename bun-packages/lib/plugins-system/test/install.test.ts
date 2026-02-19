import { describe, expect, it } from "vitest";
import { createPluginManager } from "../src/services";
import type { Plugin } from "../src/types";
import { createTestPlugin } from "./utils";

describe("Plugin Manager Service - install", () => {
	it("should install a plugin", async () => {
		const manager = createPluginManager({ pluginDir: "./test-plugins" });
		const plugin = createTestPlugin("test-1");

		await manager.install(plugin);

		const state = manager.get("test-1");
		expect(state).toBeDefined();
		expect(state?.status).toBe("installed");
		expect(state?.plugin).toBe(plugin);
	});

	it("should prevent duplicate installation", async () => {
		const manager = createPluginManager({ pluginDir: "./test-plugins" });
		const plugin = createTestPlugin("test-1");

		await manager.install(plugin);

		await expect(manager.install(plugin)).rejects.toThrow(
			"Plugin test-1 is already installed",
		);
	});

	it("should respect maxPlugins limit", async () => {
		const manager = createPluginManager({
			pluginDir: "./test-plugins",
			maxPlugins: 2,
		});

		await manager.install(createTestPlugin("test-1"));
		await manager.install(createTestPlugin("test-2"));

		await expect(manager.install(createTestPlugin("test-3"))).rejects.toThrow(
			"Maximum number of plugins",
		);
	});

	it("should detect circular dependencies", async () => {
		const manager = createPluginManager({ pluginDir: "./test-plugins" });

		const plugin1: Plugin = {
			...createTestPlugin("plugin-1"),
			dependencies: [{ id: "plugin-2", version: "1.0.0" }],
		};

		const plugin2: Plugin = {
			...createTestPlugin("plugin-2"),
			dependencies: [{ id: "plugin-1", version: "1.0.0" }],
		};

		await manager.install(plugin1);

		await expect(manager.install(plugin2)).rejects.toThrow(
			"Circular dependency detected",
		);
	});

	it("should call onInstall hook", async () => {
		let hookCalled = false;

		const plugin: Plugin = {
			...createTestPlugin("test-1"),
			hooks: {
				onInstall: async () => {
					hookCalled = true;
				},
			},
		};

		const manager = createPluginManager({ pluginDir: "./test-plugins" });
		await manager.install(plugin);

		expect(hookCalled).toBe(true);
	});

	it("should emit installed event", async () => {
		const manager = createPluginManager({ pluginDir: "./test-plugins" });
		const plugin = createTestPlugin("test-1");

		let eventReceived = false;
		manager.events.on("plugin:installed", (event) => {
			if (event.pluginId === "test-1") {
				eventReceived = true;
			}
		});

		await manager.install(plugin);

		// Small delay to ensure event is processed
		await new Promise((resolve) => setTimeout(resolve, 10));

		expect(eventReceived).toBe(true);
	});
});
