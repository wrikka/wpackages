import { describe, expect, it } from "vitest";
import { createPluginManager } from "../src/services";
import { createTestPlugin } from "./utils";

describe("Plugin Manager Service - Registry", () => {
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
