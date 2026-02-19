import { describe, expect, it } from "vitest";
import type { Plugin, PluginHealthCheck, PluginPerformanceStats, PluginState } from "../types";
import {
	formatDate,
	formatHealth,
	formatList,
	formatPluginInfo,
	formatStats,
	formatStatus,
	formatTable,
} from "./format.utils";

describe("format.utils", () => {
	const createMockPlugin = (): Plugin => ({
		metadata: {
			id: "test-plugin",
			name: "Test Plugin",
			version: "1.0.0",
			author: "Test Author",
			description: "A test plugin",
		},
		init: async () => {},
	});

	const createMockPluginState = (
		overrides?: Partial<PluginState>,
	): PluginState => ({
		plugin: createMockPlugin(),
		status: "enabled",
		installedAt: new Date("2024-01-01T00:00:00Z"),
		enabledAt: new Date("2024-01-01T01:00:00Z"),
		...overrides,
	});

	describe("formatPluginInfo", () => {
		it("should format plugin info with all fields", () => {
			const state = createMockPluginState();
			const result = formatPluginInfo(state);

			expect(result).toContain("Test Plugin");
			expect(result).toContain("test-plugin");
			expect(result).toContain("1.0.0");
			expect(result).toContain("Test Author");
			expect(result).toContain("A test plugin");
		});

		it("should format plugin without description", () => {
			const plugin: Plugin = {
				metadata: {
					id: "test",
					name: "Test",
					version: "1.0.0",
					author: "Author",
				},
				init: async () => {},
			};

			const state: PluginState = {
				plugin,
				status: "installed",
				installedAt: new Date(),
			};

			const result = formatPluginInfo(state);

			expect(result).toContain("Test");
			expect(result).not.toContain("undefined");
		});

		it("should format plugin without enabledAt", () => {
			const state = createMockPluginState({ enabledAt: undefined });
			const result = formatPluginInfo(state);

			expect(result).toContain("Installed:");
			expect(result).not.toContain("Enabled:");
		});
	});

	describe("formatStatus", () => {
		it("should format enabled status", () => {
			expect(formatStatus("enabled")).toBe("🟢 Enabled");
		});

		it("should format disabled status", () => {
			expect(formatStatus("disabled")).toBe("🔴 Disabled");
		});

		it("should format installed status", () => {
			expect(formatStatus("installed")).toBe("⚪ Installed");
		});

		it("should format error status", () => {
			expect(formatStatus("error")).toBe("❌ Error");
		});
	});

	describe("formatDate", () => {
		it("should format date to locale string", () => {
			const date = new Date("2024-01-01T00:00:00Z");
			const result = formatDate(date);

			expect(typeof result).toBe("string");
			expect(result.length).toBeGreaterThan(0);
		});
	});

	describe("formatHealth", () => {
		it("should format healthy plugin", () => {
			const health: PluginHealthCheck = {
				pluginId: "test-plugin",
				healthy: true,
				message: "All good",
			};

			const result = formatHealth(health);

			expect(result).toContain("✅");
			expect(result).toContain("test-plugin");
			expect(result).toContain("All good");
		});

		it("should format unhealthy plugin", () => {
			const health: PluginHealthCheck = {
				pluginId: "test-plugin",
				healthy: false,
				message: "Error occurred",
			};

			const result = formatHealth(health);

			expect(result).toContain("⚠️");
			expect(result).toContain("test-plugin");
			expect(result).toContain("Error occurred");
		});

		it("should handle missing message", () => {
			const health: PluginHealthCheck = {
				pluginId: "test-plugin",
				healthy: true,
			};

			const result = formatHealth(health);

			expect(result).toContain("Unknown");
		});
	});

	describe("formatStats", () => {
		it("should format performance stats", () => {
			const stats: PluginPerformanceStats = {
				totalPlugins: 10,
				enabledPlugins: 8,
				errorPlugins: 1,
				averageLoadTime: 123.45,
				averageInitTime: 67.89,
			};

			const result = formatStats(stats);

			expect(result).toContain("📊");
			expect(result).toContain("10");
			expect(result).toContain("8");
			expect(result).toContain("1");
			expect(result).toContain("123.45");
			expect(result).toContain("67.89");
		});

		it("should format decimal numbers correctly", () => {
			const stats: PluginPerformanceStats = {
				totalPlugins: 5,
				enabledPlugins: 5,
				errorPlugins: 0,
				averageLoadTime: 100.123456,
				averageInitTime: 50.987654,
			};

			const result = formatStats(stats);

			expect(result).toContain("100.12");
			expect(result).toContain("50.99");
		});
	});

	describe("formatList", () => {
		it("should format list of items", () => {
			const items = ["item1", "item2", "item3"];
			const result = formatList(items);

			expect(result).toContain("1. item1");
			expect(result).toContain("2. item2");
			expect(result).toContain("3. item3");
		});

		it("should handle empty list", () => {
			const result = formatList([]);

			expect(result).toBe("");
		});

		it("should handle single item", () => {
			const result = formatList(["single"]);

			expect(result).toContain("1. single");
		});
	});

	describe("formatTable", () => {
		it("should format table with headers and rows", () => {
			const headers = ["Name", "Version", "Status"];
			const rows = [
				["Plugin A", "1.0.0", "enabled"],
				["Plugin B", "2.0.0", "disabled"],
			];

			const result = formatTable(headers, rows);

			expect(result).toContain("Name");
			expect(result).toContain("Version");
			expect(result).toContain("Status");
			expect(result).toContain("Plugin A");
			expect(result).toContain("Plugin B");
			expect(result).toContain("|");
			expect(result).toContain("-");
		});

		it("should align columns properly", () => {
			const headers = ["Short", "Very Long Header"];
			const rows = [
				["A", "B"],
				["C", "D"],
			];

			const result = formatTable(headers, rows);
			const lines = result.split("\n");

			expect(lines[0]).toBeDefined();
			expect(lines[0]?.includes("|")).toBe(true);
		});

		it("should handle empty rows", () => {
			const headers = ["A", "B"];
			const rows: string[][] = [];

			const result = formatTable(headers, rows);

			expect(result).toBe("");
		});
	});
});
