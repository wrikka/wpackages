import { describe, expect, it } from "vitest";
import { createPluginManager } from "../src/services";
import type { Plugin } from "../src/types";
import { createTestPlugin } from "./utils";

describe("Plugin Manager Service - uninstall", () => {
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
