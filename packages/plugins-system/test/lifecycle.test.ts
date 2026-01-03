import { describe, expect, it } from "vitest";
import { createPluginManager } from "../src/services";
import type { Plugin } from "../src/types";
import { createTestPlugin } from "./utils";

describe("Plugin Manager Service - Lifecycle", () => {
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
});
