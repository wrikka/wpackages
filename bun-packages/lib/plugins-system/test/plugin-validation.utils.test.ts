/**
 * Plugin Validation Utils Tests
 */

import { describe, expect, it } from "vitest";
import type { Plugin, PluginMetadata } from "../src/types";
import { isPluginCompatible, validatePlugin, validatePluginMetadata } from "../src/utils";

describe("Plugin Validation Utils", () => {
	describe("validatePluginMetadata", () => {
		const validMetadata: PluginMetadata = {
			id: "test-plugin",
			name: "Test Plugin",
			version: "1.0.0",
			description: "A test plugin",
			author: "Test Author",
		};

		it("should validate correct metadata", () => {
			const errors = validatePluginMetadata(validMetadata);
			expect(errors).toEqual([]);
		});

		it("should require id", () => {
			const metadata = { ...validMetadata, id: "" };
			const errors = validatePluginMetadata(metadata);

			expect(errors).toContain("Plugin id is required");
		});

		it("should require name", () => {
			const metadata = { ...validMetadata, name: "" };
			const errors = validatePluginMetadata(metadata);

			expect(errors).toContain("Plugin name is required");
		});

		it("should require version", () => {
			const metadata = { ...validMetadata, version: "" };
			const errors = validatePluginMetadata(metadata);

			expect(errors.length).toBeGreaterThan(0);
		});

		it("should validate semver format", () => {
			const metadata = { ...validMetadata, version: "invalid" };
			const errors = validatePluginMetadata(metadata);

			expect(errors).toContain(
				"Plugin version must follow semver format (e.g., 1.0.0)",
			);
		});

		it("should accept valid semver versions", () => {
			const versions = ["1.0.0", "0.1.0", "10.20.30"];

			for (const version of versions) {
				const metadata = { ...validMetadata, version };
				const errors = validatePluginMetadata(metadata);
				expect(errors).toEqual([]);
			}
		});

		it("should require author", () => {
			const metadata = { ...validMetadata, author: "" };
			const errors = validatePluginMetadata(metadata);

			expect(errors).toContain("Plugin author is required");
		});

		it("should trim whitespace", () => {
			const metadata = {
				...validMetadata,
				id: "  ",
				name: "  ",
			};
			const errors = validatePluginMetadata(metadata);

			expect(errors).toContain("Plugin id is required");
			expect(errors).toContain("Plugin name is required");
		});
	});

	describe("validatePlugin", () => {
		const createValidPlugin = (): Plugin => ({
			metadata: {
				id: "test-plugin",
				name: "Test Plugin",
				version: "1.0.0",
				description: "A test plugin",
				author: "Test Author",
			},
			init: async () => {},
		});

		it("should validate correct plugin", () => {
			const plugin = createValidPlugin();
			const errors = validatePlugin(plugin);

			expect(errors).toEqual([]);
		});

		it("should validate metadata", () => {
			const plugin = {
				...createValidPlugin(),
				metadata: {
					...createValidPlugin().metadata,
					id: "",
				},
			};

			const errors = validatePlugin(plugin);
			expect(errors).toContain("Plugin id is required");
		});

		it("should require init function", () => {
			const plugin = {
				...createValidPlugin(),
				init: "not a function" as never,
			};

			const errors = validatePlugin(plugin);
			expect(errors).toContain("Plugin init must be a function");
		});

		it("should validate dependencies", () => {
			const plugin: Plugin = {
				...createValidPlugin(),
				dependencies: [
					{ id: "", version: "1.0.0" },
					{ id: "valid-dep", version: "" },
				],
			};

			const errors = validatePlugin(plugin);

			expect(errors).toContain("Dependency id is required");
			expect(errors.some((e) => e.includes("version is required"))).toBe(true);
		});

		it("should accept valid dependencies", () => {
			const plugin: Plugin = {
				...createValidPlugin(),
				dependencies: [
					{ id: "dep-1", version: "1.0.0" },
					{ id: "dep-2", version: "2.0.0", optional: true },
				],
			};

			const errors = validatePlugin(plugin);
			expect(errors).toEqual([]);
		});

		it("should accept plugin without dependencies", () => {
			const plugin = createValidPlugin();
			const errors = validatePlugin(plugin);

			expect(errors).toEqual([]);
		});
	});

	describe("isPluginCompatible", () => {
		it("should accept exact version match", () => {
			expect(isPluginCompatible("1.0.0", "1.0.0")).toBe(true);
		});

		it("should accept higher patch version", () => {
			expect(isPluginCompatible("1.0.0", "1.0.5")).toBe(true);
		});

		it("should accept higher minor version", () => {
			expect(isPluginCompatible("1.0.0", "1.5.0")).toBe(true);
			expect(isPluginCompatible("1.2.0", "1.5.0")).toBe(true);
		});

		it("should reject lower patch version", () => {
			expect(isPluginCompatible("1.0.5", "1.0.0")).toBe(false);
		});

		it("should reject lower minor version", () => {
			expect(isPluginCompatible("1.5.0", "1.0.0")).toBe(false);
		});

		it("should reject different major version", () => {
			expect(isPluginCompatible("1.0.0", "2.0.0")).toBe(false);
			expect(isPluginCompatible("2.0.0", "1.0.0")).toBe(false);
		});

		it("should handle version with different lengths", () => {
			expect(isPluginCompatible("1.0", "1.0.0")).toBe(true);
			expect(isPluginCompatible("1", "1.0.0")).toBe(true);
		});

		it("should be transitive for compatible versions", () => {
			// If A compatible with B and B compatible with C, then A compatible with C
			const versions = ["1.0.0", "1.2.0", "1.5.0"];

			for (let i = 0; i < versions.length - 1; i++) {
				expect(isPluginCompatible(versions[i]!, versions[i + 1]!)).toBe(true);
			}

			// First should be compatible with last
			expect(
				isPluginCompatible(versions[0]!, versions[versions.length - 1]!),
			).toBe(true);
		});
	});
});
