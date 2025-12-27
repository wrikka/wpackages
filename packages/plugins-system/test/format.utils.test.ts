/**
 * Format Utils Tests
 */

import { describe, expect, it } from "vitest";
import type { PluginHealthCheck, PluginPerformanceStats, PluginState } from "../src/types";
import {
	formatDate,
	formatHealth,
	formatList,
	formatPluginInfo,
	formatStats,
	formatStatus,
	formatTable,
} from "../src/utils/format.utils";

describe("Format Utils", () => {
	describe("formatStatus", () => {
		it("should format disabled status", () => {
			expect(formatStatus("disabled")).toBe("🔴 Disabled");
		});

		it("should format enabled status", () => {
			expect(formatStatus("enabled")).toBe("🟢 Enabled");
		});

		it("should format error status", () => {
			expect(formatStatus("error")).toBe("❌ Error");
		});

		it("should format installed status", () => {
			expect(formatStatus("installed")).toBe("⚪ Installed");
		});
	});

	describe("formatDate", () => {
		it("should format date to locale string", () => {
			const date = new Date("2024-01-01T12:00:00Z");
			const formatted = formatDate(date);

			expect(formatted).toBe(date.toLocaleString());
		});

		it("should handle different dates", () => {
			const date1 = new Date("2024-01-01T00:00:00Z");
			const date2 = new Date("2024-12-31T23:59:59Z");

			expect(formatDate(date1)).not.toBe(formatDate(date2));
		});
	});

	describe("formatPluginInfo", () => {
		it("should format plugin info with all fields", () => {
			const installedAt = new Date("2024-01-01T12:00:00Z");
			const enabledAt = new Date("2024-01-01T12:05:00Z");

			const state: PluginState = {
				plugin: {
					metadata: {
						id: "test-plugin",
						name: "Test Plugin",
						version: "1.0.0",
						author: "Test Author",
						description: "A test plugin",
					},
					init: async () => {},
				},
				status: "enabled",
				installedAt,
				enabledAt,
			};

			const formatted = formatPluginInfo(state);

			expect(formatted).toContain("📦 Test Plugin (test-plugin)");
			expect(formatted).toContain("Version: 1.0.0");
			expect(formatted).toContain("Status: 🟢 Enabled");
			expect(formatted).toContain("Author: Test Author");
			expect(formatted).toContain("A test plugin");
			expect(formatted).toContain(`Installed: ${formatDate(installedAt)}`);
			expect(formatted).toContain(`Enabled: ${formatDate(enabledAt)}`);
		});

		it("should format plugin info without enabledAt", () => {
			const installedAt = new Date("2024-01-01T12:00:00Z");

			const state: PluginState = {
				plugin: {
					metadata: {
						id: "test-plugin",
						name: "Test Plugin",
						version: "1.0.0",
						description: "Test Description",
						author: "Test Author",
					},
					init: async () => {},
				},
				status: "installed",
				installedAt,
			};

			const formatted = formatPluginInfo(state);

			expect(formatted).not.toContain("Enabled:");
		});

		it("should format plugin info without description", () => {
			const installedAt = new Date("2024-01-01T12:00:00Z");

			const state: PluginState = {
				plugin: {
					metadata: {
						id: "test-plugin",
						name: "Test Plugin",
						version: "1.0.0",
						description: "Test Description",
						author: "Test Author",
					},
					init: async () => {},
				},
				status: "disabled",
				installedAt,
			};

			const formatted = formatPluginInfo(state);

			expect(formatted).toContain("📦 Test Plugin (test-plugin)");
			expect(formatted).toContain("Version: 1.0.0");
			expect(formatted).toContain("Status: 🔴 Disabled");
		});
	});

	describe("formatHealth", () => {
		it("should format healthy status", () => {
			const health: PluginHealthCheck = {
				pluginId: "test-plugin",
				healthy: true,
				lastCheck: new Date(),
				message: "All systems operational",
			};

			const formatted = formatHealth(health);

			expect(formatted).toBe("✅ test-plugin: All systems operational");
		});

		it("should format unhealthy status", () => {
			const health: PluginHealthCheck = {
				pluginId: "test-plugin",
				healthy: false,
				lastCheck: new Date(),
				message: "Connection timeout",
			};

			const formatted = formatHealth(health);

			expect(formatted).toBe("⚠️ test-plugin: Connection timeout");
		});

		it("should handle missing message", () => {
			const health: PluginHealthCheck = {
				pluginId: "test-plugin",
				healthy: true,
				lastCheck: new Date(),
			};

			const formatted = formatHealth(health);

			expect(formatted).toBe("✅ test-plugin: Unknown");
		});

		it("should handle missing lastCheck and message", () => {
			const health: PluginHealthCheck = {
				pluginId: "test-plugin",
				healthy: true,
			};

			const formatted = formatHealth(health);

			expect(formatted).toBe("✅ test-plugin: Unknown");
		});

		it("should handle missing lastCheck and message", () => {
			const health: PluginHealthCheck = {
				pluginId: "test-plugin",
				healthy: true,
				lastCheck: new Date(),
			};

			const formatted = formatHealth(health);

			expect(formatted).toBe("✅ test-plugin: Unknown");
		});
	});

describe("formatStats", () => {
	it("should format performance statistics", () => {
		const stats: PluginPerformanceStats = {
			totalPlugins: 10,
			enabledPlugins: 7,
			errorPlugins: 1,
			averageLoadTime: 123.456,
			averageInitTime: 78.901,
		};

		const formatted = formatStats(stats);

		expect(formatted).toContain("📊 Plugin Statistics");
		expect(formatted).toContain("Total Plugins: 10");
		expect(formatted).toContain("Enabled: 7");
		expect(formatted).toContain("Errors: 1");
		expect(formatted).toContain("Avg Load Time: 123.46ms");
		expect(formatted).toContain("Avg Init Time: 78.90ms");
	});

	it("should format stats with zero values", () => {
		const stats: PluginPerformanceStats = {
			totalPlugins: 0,
			enabledPlugins: 0,
			errorPlugins: 0,
			averageLoadTime: 0,
			averageInitTime: 0,
		};

		const formatted = formatStats(stats);

		expect(formatted).toContain("Total Plugins: 0");
		expect(formatted).toContain("Avg Load Time: 0.00ms");
	});

	it("should round average times to 2 decimal places", () => {
		const stats: PluginPerformanceStats = {
			totalPlugins: 5,
			enabledPlugins: 5,
			errorPlugins: 0,
			averageLoadTime: 123.456789,
			averageInitTime: 78.901234,
		};

		const formatted = formatStats(stats);

		expect(formatted).toContain("Avg Load Time: 123.46ms");
		expect(formatted).toContain("Avg Init Time: 78.90ms");
	});
});

describe("formatList", () => {
	it("should format list of items", () => {
		const items = ["First item", "Second item", "Third item"];
		const formatted = formatList(items);

		expect(formatted).toBe(
			"  1. First item\n  2. Second item\n  3. Third item",
		);
	});

	it("should handle empty list", () => {
		const formatted = formatList([]);
		expect(formatted).toBe("");
	});

	it("should handle single item", () => {
		const formatted = formatList(["Only item"]);
		expect(formatted).toBe("  1. Only item");
	});
});

describe("formatTable", () => {
	it("should format table with headers and rows", () => {
		const headers = ["Name", "Status", "Version"];
		const rows = [
			["Plugin A", "Enabled", "1.0.0"],
			["Plugin B", "Disabled", "2.0.0"],
		];

		const formatted = formatTable(headers, rows);

		expect(formatted).toContain("Name");
		expect(formatted).toContain("Status");
		expect(formatted).toContain("Version");
		expect(formatted).toContain("Plugin A");
		expect(formatted).toContain("Enabled");
		expect(formatted).toContain("1.0.0");
		expect(formatted).toContain("Plugin B");
		expect(formatted).toContain("Disabled");
		expect(formatted).toContain("2.0.0");
	});

	it("should align columns properly", () => {
		const headers = ["ID", "Name"];
		const rows = [
			["1", "A"],
			["2", "B"],
		];

		const formatted = formatTable(headers, rows);
		const lines = formatted.split("\n");

		// Check that separator exists (with column separators)
		expect(lines[1]).toMatch(/^-+(\+-+)+$/);
	});

	it("should handle empty table", () => {
		const formatted = formatTable([], []);
		expect(formatted).toBe("");
	});

	it("should handle varying column widths", () => {
		const headers = ["Short", "Very Long Header"];
		const rows = [
			["X", "Y"],
			["A", "B"],
		];

		const formatted = formatTable(headers, rows);

		// Should not throw and should contain all data
		expect(formatted).toContain("Short");
		expect(formatted).toContain("Very Long Header");
		expect(formatted).toContain("X");
		expect(formatted).toContain("Y");
	});

	it("should handle missing cells in rows", () => {
		const headers = ["A", "B", "C"];
		const rows = [
			["1", "2"],
			["3", "4", "5"],
		];

		const formatted = formatTable(headers, rows);

		expect(formatted).toContain("A");
		expect(formatted).toContain("B");
		expect(formatted).toContain("C");
	});
});
});
