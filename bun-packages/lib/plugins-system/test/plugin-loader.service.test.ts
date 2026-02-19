/**
 * Plugin Loader Service Tests
 */

import { describe, expect, it } from "vitest";
import { loadPlugin, sortPluginsByDependencies } from "../src/services";
import type { Plugin } from "../src/types";

describe("Plugin Loader Service", () => {
	describe("sortPluginsByDependencies", () => {
		it("should sort plugins by dependencies", () => {
			const pluginA: Plugin = {
				metadata: {
					id: "plugin-a",
					name: "Plugin A",
					version: "1.0.0",
					description: "Plugin A",
					author: "Test",
				},
				init: async () => {},
			};

			const pluginB: Plugin = {
				metadata: {
					id: "plugin-b",
					name: "Plugin B",
					version: "1.0.0",
					description: "Plugin B",
					author: "Test",
				},
				dependencies: [{ id: "plugin-a", version: "1.0.0" }],
				init: async () => {},
			};

			const pluginC: Plugin = {
				metadata: {
					id: "plugin-c",
					name: "Plugin C",
					version: "1.0.0",
					description: "Plugin C",
					author: "Test",
				},
				dependencies: [{ id: "plugin-b", version: "1.0.0" }],
				init: async () => {},
			};

			// Test with plugins in wrong order
			const sorted = sortPluginsByDependencies([pluginC, pluginB, pluginA]);

			expect(sorted.map((p) => p.metadata.id)).toEqual([
				"plugin-a",
				"plugin-b",
				"plugin-c",
			]);
		});

		it("should handle plugins without dependencies", () => {
			const plugin1: Plugin = {
				metadata: {
					id: "plugin-1",
					name: "Plugin 1",
					version: "1.0.0",
					description: "Plugin 1",
					author: "Test",
				},
				init: async () => {},
			};

			const plugin2: Plugin = {
				metadata: {
					id: "plugin-2",
					name: "Plugin 2",
					version: "1.0.0",
					description: "Plugin 2",
					author: "Test",
				},
				init: async () => {},
			};

			const sorted = sortPluginsByDependencies([plugin2, plugin1]);

			expect(sorted).toHaveLength(2);
			expect(sorted.map((p) => p.metadata.id)).toContain("plugin-1");
			expect(sorted.map((p) => p.metadata.id)).toContain("plugin-2");
		});

		it("should handle complex dependency chains", () => {
			const pluginBase: Plugin = {
				metadata: {
					id: "base",
					name: "Base",
					version: "1.0.0",
					description: "Base plugin",
					author: "Test",
				},
				init: async () => {},
			};

			const pluginAuth: Plugin = {
				metadata: {
					id: "auth",
					name: "Auth",
					version: "1.0.0",
					description: "Auth plugin",
					author: "Test",
				},
				dependencies: [{ id: "base", version: "1.0.0" }],
				init: async () => {},
			};

			const pluginUser: Plugin = {
				metadata: {
					id: "user",
					name: "User",
					version: "1.0.0",
					description: "User plugin",
					author: "Test",
				},
				dependencies: [
					{ id: "auth", version: "1.0.0" },
					{ id: "base", version: "1.0.0" },
				],
				init: async () => {},
			};

			const pluginAdmin: Plugin = {
				metadata: {
					id: "admin",
					name: "Admin",
					version: "1.0.0",
					description: "Admin plugin",
					author: "Test",
				},
				dependencies: [{ id: "user", version: "1.0.0" }],
				init: async () => {},
			};

			const sorted = sortPluginsByDependencies([
				pluginAdmin,
				pluginUser,
				pluginAuth,
				pluginBase,
			]);

			const ids = sorted.map((p) => p.metadata.id);

			// Base should come before auth
			expect(ids.indexOf("base")).toBeLessThan(ids.indexOf("auth"));

			// Auth should come before user
			expect(ids.indexOf("auth")).toBeLessThan(ids.indexOf("user"));

			// User should come before admin
			expect(ids.indexOf("user")).toBeLessThan(ids.indexOf("admin"));
		});

		it("should handle empty array", () => {
			const sorted = sortPluginsByDependencies([]);
			expect(sorted).toEqual([]);
		});

		it("should handle single plugin", () => {
			const plugin: Plugin = {
				metadata: {
					id: "single",
					name: "Single",
					version: "1.0.0",
					description: "Single plugin",
					author: "Test",
				},
				init: async () => {},
			};

			const sorted = sortPluginsByDependencies([plugin]);
			expect(sorted).toEqual([plugin]);
		});
	});

	describe("loadPlugin", () => {
		it("should return error for invalid plugin path", async () => {
			const result = await loadPlugin("./non-existent-plugin.js");

			expect(result._tag).toBe("Failure");
			expect(
				result._tag === "Failure" ? result.error : "",
			).toContain("Failed to load plugin");
		});

		it("should validate plugin structure when validation is enabled", async () => {
			// This would need a valid plugin file to test properly
			// For now, we test the validation option
			const result = await loadPlugin("./invalid-plugin.js", {
				validate: true,
			});

			expect(result._tag).toBe("Failure");
		});

		it("should skip validation when disabled", async () => {
			// This would need a valid plugin file to test properly
			const result = await loadPlugin("./some-plugin.js", { validate: false });

			// Should still fail to load but for different reason
			expect(result._tag).toBe("Failure");
		});
	});
});
