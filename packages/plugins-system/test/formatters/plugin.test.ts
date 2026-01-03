import { describe, expect, it } from "vitest";
import type { PluginState } from "../../src/types";
import { formatDate, formatPluginInfo, formatStatus } from "../../src/utils/format.utils";

describe("Format Utils - formatPluginInfo", () => {
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
		expect(formatted).toContain(`Status: ${formatStatus("enabled")}`);
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
					author: "Test Author",
					description: "", // Description is required, even if empty
				},
				init: async () => {},
			},
			status: "disabled",
			installedAt,
		};

		const formatted = formatPluginInfo(state);

		expect(formatted).toContain("📦 Test Plugin (test-plugin)");
		expect(formatted).toContain("Version: 1.0.0");
		expect(formatted).toContain(`Status: ${formatStatus("disabled")}`);
	});
});
