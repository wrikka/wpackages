/**
 * Plugin Manager Service Tests
 */

import { describe, expect, it } from "vitest";
import { createPluginManager } from "../src/services";
import type { Plugin } from "../src/types";

describe("Plugin Manager Service", () => {
	const createTestPlugin = (
		id: string,
		dependencies?: Array<{ id: string; version: string }>,
	): Plugin => ({
		metadata: {
			id,
			name: `Test Plugin ${id}`,
			version: "1.0.0",
			description: "Test plugin",
			author: "Test",
		},
		dependencies,
		init: async () => {},
	});

	describe("install", () => {
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

	describe("enable", () => {
		it("should enable an installed plugin", async () => {
			const manager = createPluginManager({ pluginDir: "./test-plugins" });
			const plugin = createTestPlugin("test-1");

			await manager.install(plugin);
			await manager.enable("test-1");

			const state = manager.get("test-1");
			expect(state?.status).toBe("enabled");
			expect(state?.enabledAt).toBeDefined();
		});

		it("should throw error for non-installed plugin", async () => {
			const manager = createPluginManager({ pluginDir: "./test-plugins" });

			const result = await manager.enable("non-existent");
			expect(result).toEqual({
				_tag: "Failure",
				error: "Plugin non-existent is not installed",
			});
		});

		it("should call init and onEnable hooks", async () => {
			let initCalled = false;
			let enableCalled = false;

			const plugin: Plugin = {
				...createTestPlugin("test-1"),
				init: async () => {
					initCalled = true;
				},
				hooks: {
					onEnable: async () => {
						enableCalled = true;
					},
				},
			};

			const manager = createPluginManager({ pluginDir: "./test-plugins" });
			await manager.install(plugin);
			await manager.enable("test-1");

			expect(initCalled).toBe(true);
			expect(enableCalled).toBe(true);
		});

		it("should be idempotent (enabling enabled plugin does nothing)", async () => {
			const manager = createPluginManager({ pluginDir: "./test-plugins" });
			const plugin = createTestPlugin("test-1");

			await manager.install(plugin);
			await manager.enable("test-1");

			const state1 = manager.get("test-1");
			const enabledAt = state1?.enabledAt;

			// Enable again
			await manager.enable("test-1");

			const state2 = manager.get("test-1");
			expect(state2?.enabledAt).toBe(enabledAt);
		});

		it("should set error status on init failure", async () => {
			const plugin: Plugin = {
				...createTestPlugin("test-1"),
				init: async () => {
					throw new Error("Init failed");
				},
			};

			const manager = createPluginManager({ pluginDir: "./test-plugins" });
			await manager.install(plugin);

			const result = await manager.enable("test-1");
			expect(result._tag).toBe("Failure");

			const state = manager.get("test-1");
			expect(state?.status).toBe("error");
			expect(state?.error).toBeDefined();
		});
	});

	describe("disable", () => {
		it("should disable an enabled plugin", async () => {
			const manager = createPluginManager({ pluginDir: "./test-plugins" });
			const plugin = createTestPlugin("test-1");

			await manager.install(plugin);
			await manager.enable("test-1");
			await manager.disable("test-1");

			const state = manager.get("test-1");
			expect(state?.status).toBe("disabled");
		});

		it("should call onDisable hook", async () => {
			let disableCalled = false;

			const plugin: Plugin = {
				...createTestPlugin("test-1"),
				hooks: {
					onDisable: async () => {
						disableCalled = true;
					},
				},
			};

			const manager = createPluginManager({ pluginDir: "./test-plugins" });
			await manager.install(plugin);
			await manager.enable("test-1");
			await manager.disable("test-1");

			expect(disableCalled).toBe(true);
		});

		it("should be idempotent (disabling disabled plugin does nothing)", async () => {
			const manager = createPluginManager({ pluginDir: "./test-plugins" });
			const plugin = createTestPlugin("test-1");

			await manager.install(plugin);
			await manager.enable("test-1");
			await manager.disable("test-1");

			// Disable again should not throw
			await expect(manager.disable("test-1")).resolves.not.toThrow();
		});
	});

	describe("uninstall", () => {
		it("should uninstall a plugin", async () => {
			const manager = createPluginManager({ pluginDir: "./test-plugins" });
			const plugin = createTestPlugin("test-1");

			await manager.install(plugin);
			await manager.uninstall("test-1");

			const state = manager.get("test-1");
			expect(state).toBeUndefined();
		});

		it("should disable plugin before uninstalling", async () => {
			let disableCalled = false;

			const plugin: Plugin = {
				...createTestPlugin("test-1"),
				hooks: {
					onDisable: async () => {
						disableCalled = true;
					},
				},
			};

			const manager = createPluginManager({ pluginDir: "./test-plugins" });
			await manager.install(plugin);
			await manager.enable("test-1");
			await manager.uninstall("test-1");

			expect(disableCalled).toBe(true);
		});

		it("should call onUninstall hook", async () => {
			let uninstallCalled = false;

			const plugin: Plugin = {
				...createTestPlugin("test-1"),
				hooks: {
					onUninstall: async () => {
						uninstallCalled = true;
					},
				},
			};

			const manager = createPluginManager({ pluginDir: "./test-plugins" });
			await manager.install(plugin);
			await manager.uninstall("test-1");

			expect(uninstallCalled).toBe(true);
		});
	});

	describe("get and getAll", () => {
		it("should get specific plugin state", async () => {
			const manager = createPluginManager({ pluginDir: "./test-plugins" });
			const plugin = createTestPlugin("test-1");

			await manager.install(plugin);

			const state = manager.get("test-1");
			expect(state).toBeDefined();
			expect(state?.plugin.metadata.id).toBe("test-1");
		});

		it("should return undefined for non-existent plugin", () => {
			const manager = createPluginManager({ pluginDir: "./test-plugins" });

			const state = manager.get("non-existent");
			expect(state).toBeUndefined();
		});

		it("should get all plugins", async () => {
			const manager = createPluginManager({ pluginDir: "./test-plugins" });

			await manager.install(createTestPlugin("test-1"));
			await manager.install(createTestPlugin("test-2"));

			const all = manager.getAll();
			expect(all).toHaveLength(2);
			expect(all.map((s) => s.plugin.metadata.id)).toContain("test-1");
			expect(all.map((s) => s.plugin.metadata.id)).toContain("test-2");
		});

		it("should get only enabled plugins", async () => {
			const manager = createPluginManager({ pluginDir: "./test-plugins" });

			await manager.install(createTestPlugin("test-1"));
			await manager.install(createTestPlugin("test-2"));
			await manager.enable("test-1");

			const enabled = manager.getEnabled();
			expect(enabled).toHaveLength(1);
			expect(enabled[0]?.plugin.metadata.id).toBe("test-1");
		});
	});
});
