import { describe, expect, it } from "vitest";
import type { Plugin, PluginMetadata } from "../types";
import { isPluginCompatible, validatePlugin, validatePluginMetadata } from "./plugin-validation.utils";

describe("plugin-validation.utils", () => {
	const createValidMetadata = (
		overrides?: Partial<PluginMetadata>,
	): PluginMetadata => ({
		id: "test-plugin",
		name: "Test Plugin",
		version: "1.0.0",
		author: "Test Author",
		description: "A test plugin",
		...overrides,
	});

	const createValidPlugin = (overrides?: Partial<Plugin>): Plugin => ({
		metadata: createValidMetadata(),
		init: async () => {},
		...overrides,
	});

	describe("validatePluginMetadata", () => {
		it("should return no errors for valid metadata", () => {
			const metadata = createValidMetadata();
			const errors = validatePluginMetadata(metadata);

			expect(errors).toEqual([]);
			expect(Object.isFrozen(errors)).toBe(true);
		});

		it("should detect missing id", () => {
			const metadata = createValidMetadata({ id: "" });
			const errors = validatePluginMetadata(metadata);

			expect(errors.length).toBeGreaterThan(0);
			expect(errors[0]).toContain("id is required");
		});

		it("should detect missing name", () => {
			const metadata = createValidMetadata({ name: "" });
			const errors = validatePluginMetadata(metadata);

			expect(errors.length).toBeGreaterThan(0);
			expect(errors[0]).toContain("name is required");
		});

		it("should detect missing version", () => {
			const metadata = createValidMetadata({ version: "" });
			const errors = validatePluginMetadata(metadata);

			expect(errors.some((e) => e.includes("version is required"))).toBe(true);
		});

		it("should detect invalid version format", () => {
			const metadata = createValidMetadata({ version: "invalid" });
			const errors = validatePluginMetadata(metadata);

			expect(errors.some((e) => e.includes("semver format"))).toBe(true);
		});

		it("should accept valid semver versions", () => {
			const versions = ["1.0.0", "2.10.5", "0.0.1", "1.2.3-beta"];

			for (const version of versions) {
				const metadata = createValidMetadata({ version });
				const errors = validatePluginMetadata(metadata);

				const versionErrors = errors.filter((e) => e.includes("version"));
				expect(versionErrors).toEqual([]);
			}
		});

		it("should detect missing author", () => {
			const metadata = createValidMetadata({ author: "" });
			const errors = validatePluginMetadata(metadata);

			expect(errors.length).toBeGreaterThan(0);
			expect(errors[0]).toContain("author is required");
		});

		it("should detect whitespace-only fields", () => {
			const metadata = createValidMetadata({
				id: "   ",
				name: "  ",
				author: "\t",
			});
			const errors = validatePluginMetadata(metadata);

			expect(errors.length).toBeGreaterThanOrEqual(3);
		});
	});

	describe("validatePlugin", () => {
		it("should return no errors for valid plugin", () => {
			const plugin = createValidPlugin();
			const errors = validatePlugin(plugin);

			expect(errors).toEqual([]);
			expect(Object.isFrozen(errors)).toBe(true);
		});

		it("should include metadata validation errors", () => {
			const plugin = createValidPlugin({
				metadata: createValidMetadata({ id: "" }),
			});
			const errors = validatePlugin(plugin);

			expect(errors.length).toBeGreaterThan(0);
			expect(errors.some((e) => e.includes("id is required"))).toBe(true);
		});

		it("should detect missing init function", () => {
			const plugin = createValidPlugin({ init: undefined as any });
			const errors = validatePlugin(plugin);

			expect(errors.length).toBeGreaterThan(0);
			expect(errors.some((e) => e.includes("init must be a function"))).toBe(
				true,
			);
		});

		it("should detect invalid init function", () => {
			const plugin = createValidPlugin({ init: "not a function" as any });
			const errors = validatePlugin(plugin);

			expect(errors.some((e) => e.includes("init must be a function"))).toBe(
				true,
			);
		});

		it("should validate dependencies", () => {
			const plugin = createValidPlugin({
				dependencies: [
					{ id: "", version: "1.0.0" },
					{ id: "valid-dep", version: "" },
				],
			});
			const errors = validatePlugin(plugin);

			expect(errors.length).toBeGreaterThan(0);
			expect(errors.some((e) => e.includes("Dependency id is required"))).toBe(
				true,
			);
			expect(errors.some((e) => e.includes("version is required"))).toBe(true);
		});

		it("should handle plugins without dependencies", () => {
			const plugin = createValidPlugin();
			const errors = validatePlugin(plugin);

			expect(errors).toEqual([]);
		});

		it("should handle plugins with valid dependencies", () => {
			const plugin = createValidPlugin({
				dependencies: [
					{ id: "dep1", version: "1.0.0" },
					{ id: "dep2", version: "2.0.0", optional: true },
				],
			});
			const errors = validatePlugin(plugin);

			expect(errors).toEqual([]);
		});
	});

	describe("isPluginCompatible", () => {
		it("should accept same version", () => {
			expect(isPluginCompatible("1.0.0", "1.0.0")).toBe(true);
		});

		it("should accept newer patch version", () => {
			expect(isPluginCompatible("1.0.0", "1.0.1")).toBe(true);
		});

		it("should accept newer minor version", () => {
			expect(isPluginCompatible("1.0.0", "1.1.0")).toBe(true);
		});

		it("should reject older patch version", () => {
			expect(isPluginCompatible("1.0.1", "1.0.0")).toBe(false);
		});

		it("should reject older minor version", () => {
			expect(isPluginCompatible("1.1.0", "1.0.0")).toBe(false);
		});

		it("should reject different major version", () => {
			expect(isPluginCompatible("1.0.0", "2.0.0")).toBe(false);
			expect(isPluginCompatible("2.0.0", "1.0.0")).toBe(false);
		});

		it("should handle version ranges correctly", () => {
			expect(isPluginCompatible("1.2.3", "1.2.3")).toBe(true);
			expect(isPluginCompatible("1.2.3", "1.2.4")).toBe(true);
			expect(isPluginCompatible("1.2.3", "1.3.0")).toBe(true);
			expect(isPluginCompatible("1.2.3", "1.2.2")).toBe(false);
		});

		it("should handle versions with missing patch/minor", () => {
			expect(isPluginCompatible("1.0.0", "1.0.0")).toBe(true);
			expect(isPluginCompatible("1.2.0", "1.3.0")).toBe(true);
		});
	});
});
