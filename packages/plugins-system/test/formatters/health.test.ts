import { describe, expect, it } from "vitest";
import type { PluginHealthCheck } from "../../src/types";
import { formatHealth } from "../../src/utils/format.utils";

describe("Format Utils - formatHealth", () => {
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
			lastCheck: new Date(),
		};

		const formatted = formatHealth(health);

		expect(formatted).toBe("✅ test-plugin: Unknown");
	});
});
